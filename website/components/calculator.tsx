"use client";

import { useMemo, useRef, useState } from "react";
import {
  BUILDING_TYPES,
  BuildingType,
  EnergyInput,
  LL97_SQFT_THRESHOLD,
  PenaltyResult,
  computePenalty,
  formatDollars,
  formatNumber,
  typicalEnergyFor,
} from "@/lib/ll97";
import { track } from "@/lib/analytics";
import { captureLead } from "@/lib/leads";
import AnimatedDollars from "@/components/animated-dollars";

const TYPE_ORDER: BuildingType[] = [
  "multifamily",
  "office",
  "retail",
  "hotel",
  "other",
];

type EnergyField = keyof EnergyInput;

const EMPTY_ENERGY: Record<EnergyField, string> = {
  electricityKwh: "",
  naturalGasTherms: "",
  fuelOilGallons: "",
  districtSteamMlbs: "",
};

const ENERGY_FIELDS: {
  key: EnergyField;
  label: string;
  unit: string;
  optional?: boolean;
}[] = [
  { key: "electricityKwh", label: "Electricity", unit: "kWh / yr" },
  { key: "naturalGasTherms", label: "Natural gas", unit: "therms / yr" },
  { key: "fuelOilGallons", label: "#2 fuel oil", unit: "gal / yr", optional: true },
  { key: "districtSteamMlbs", label: "District steam", unit: "Mlbs / yr", optional: true },
];

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function Calculator() {
  const [type, setType] = useState<BuildingType>("multifamily");
  const [sqft, setSqft] = useState("");
  const [energy, setEnergy] = useState<Record<EnergyField, string>>(EMPTY_ENERGY);
  const [useTypical, setUseTypical] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PenaltyResult | null>(null);
  const [belowThreshold, setBelowThreshold] = useState(false);

  const startedRef = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function markStarted() {
    if (!startedRef.current) {
      startedRef.current = true;
      track("calculator_started");
    }
  }

  function applyTypical(nextType: BuildingType, nextSqft: string) {
    const area = toNum(nextSqft);
    if (area <= 0) return;
    const t = typicalEnergyFor(nextType, area);
    setEnergy({
      electricityKwh: String(t.electricityKwh),
      naturalGasTherms: String(t.naturalGasTherms),
      fuelOilGallons: t.fuelOilGallons ? String(t.fuelOilGallons) : "",
      districtSteamMlbs: t.districtSteamMlbs ? String(t.districtSteamMlbs) : "",
    });
  }

  function onTypicalToggle(checked: boolean) {
    markStarted();
    setUseTypical(checked);
    if (checked) applyTypical(type, sqft);
  }

  function onTypeChange(next: BuildingType) {
    markStarted();
    setType(next);
    if (useTypical) applyTypical(next, sqft);
  }

  function onSqftChange(next: string) {
    markStarted();
    setSqft(next);
    if (useTypical) applyTypical(type, next);
  }

  function onEnergyChange(key: EnergyField, value: string) {
    markStarted();
    if (useTypical) setUseTypical(false); // hand-editing overrides the defaults
    setEnergy((e) => ({ ...e, [key]: value }));
  }

  const energyInput: EnergyInput = useMemo(
    () => ({
      electricityKwh: toNum(energy.electricityKwh),
      naturalGasTherms: toNum(energy.naturalGasTherms),
      fuelOilGallons: toNum(energy.fuelOilGallons),
      districtSteamMlbs: toNum(energy.districtSteamMlbs),
    }),
    [energy],
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    const area = toNum(sqft);
    if (!sqft.trim()) next.sqft = "Enter your building's gross square footage.";
    else if (area <= 0) next.sqft = "Square footage must be a positive number.";
    else if (area > 20_000_000) next.sqft = "That looks too large — check the number.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const area = toNum(sqft);
    if (area < LL97_SQFT_THRESHOLD) {
      setResult(null);
      setBelowThreshold(true);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
      return;
    }

    const hasEnergy =
      energyInput.electricityKwh > 0 ||
      energyInput.naturalGasTherms > 0 ||
      energyInput.fuelOilGallons > 0 ||
      energyInput.districtSteamMlbs > 0;

    if (!hasEnergy) {
      setErrors({
        energy:
          "Enter your annual energy use, or switch on “use a typical building like mine.”",
      });
      return;
    }

    const r = computePenalty(type, area, energyInput);
    setBelowThreshold(false);
    setResult(r);
    track("calculator_completed", {
      building_type: type,
      sqft: area,
      penalty_2030: Math.round(r.period2.annualPenalty),
      cumulative: Math.round(r.cumulative2026to2035),
      over_cap_2030: r.period2.overTons > 0,
    });
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <section id="calculator" className="scroll-mt-24 border-y border-line bg-card">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <div className="stamp-label text-stamp">
          <span className="h-2 w-2 rounded-full bg-stamp" aria-hidden="true" />
          LL97 penalty estimate
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Find your number
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          This free Local Law 97 penalty calculator estimates your LL97 fine for
          both the 2024&ndash;2029 and 2030 compliance periods. Enter what you
          know &mdash; or switch on a typical building like yours and refine later.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-2"
        >
          {/* Building type */}
          <label className="block">
            <span className="stamp-label text-muted">Building type</span>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as BuildingType)}
              className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-3 text-ink outline-none"
            >
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>
                  {BUILDING_TYPES[t].label} ({BUILDING_TYPES[t].code})
                </option>
              ))}
            </select>
          </label>

          {/* Square footage */}
          <label className="block">
            <span className="stamp-label text-muted">Gross square footage</span>
            <input
              inputMode="numeric"
              value={sqft}
              onChange={(e) => onSqftChange(e.target.value.replace(/[^0-9]/g, ""))}
              aria-invalid={Boolean(errors.sqft)}
              aria-describedby={errors.sqft ? "sqft-error" : undefined}
              placeholder="e.g. 50000"
              className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-3 text-ink outline-none tnum"
            />
            {errors.sqft && (
              <span id="sqft-error" className="mt-1 block text-sm text-stampInk">
                {errors.sqft}
              </span>
            )}
          </label>

          {/* Typical toggle */}
          <label className="flex cursor-pointer items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={useTypical}
              onChange={(e) => onTypicalToggle(e.target.checked)}
              className="h-4 w-4 accent-stamp"
            />
            <span className="text-sm text-ink">
              Use a typical building like mine{" "}
              <span className="text-muted">
                (fills usage from your type &amp; size — you can still edit it)
              </span>
            </span>
          </label>

          {/* Energy inputs */}
          <fieldset className="md:col-span-2">
            <legend className="stamp-label text-muted">
              Annual energy use
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {ENERGY_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-sm text-ink">
                    {f.label}{" "}
                    {f.optional && (
                      <span className="text-muted">(optional)</span>
                    )}
                  </span>
                  <div className="mt-1 flex items-center rounded-md border border-line bg-paper">
                    <input
                      inputMode="numeric"
                      value={energy[f.key]}
                      onChange={(e) =>
                        onEnergyChange(
                          f.key,
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      placeholder="0"
                      className="w-full bg-transparent px-3 py-2.5 text-ink outline-none tnum"
                    />
                    <span className="whitespace-nowrap px-3 text-xs text-muted">
                      {f.unit}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.energy && (
              <p className="mt-2 text-sm text-stampInk">{errors.energy}</p>
            )}
          </fieldset>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-md bg-stamp px-6 py-4 text-base font-bold text-white transition-colors hover:bg-stampInk sm:w-auto"
            >
              Show my penalty
            </button>
          </div>
        </form>

        <div ref={resultRef}>
          {belowThreshold && <BelowThreshold sqft={toNum(sqft)} type={type} />}
          {result && <Results result={result} />}
        </div>
      </div>
    </section>
  );
}

/* ---------- Results ---------- */

function Results({ result }: { result: PenaltyResult }) {
  const typeMeta = BUILDING_TYPES[result.type];
  return (
    <div className="mt-12">
      <div className="perf-top" aria-hidden="true" />
      <div className="rounded-b-lg border border-t-0 border-line bg-paper shadow-doc">
        {/* The emotional payload: 2030 annual penalty, dominant. */}
        <div className="border-b border-line px-6 py-10 text-center sm:px-10 sm:py-14">
          <div className="stamp-label justify-center text-muted">
            Your projected LL97 penalty from 2030
          </div>
          <AnimatedDollars
            value={result.period2.annualPenalty}
            className="mt-3 block text-5xl font-extrabold leading-none tracking-tight text-stamp sm:text-7xl"
          />
          <p className="mt-3 text-sm text-muted">
            per year, if your usage stays flat
            {result.approximate && " · approximate for “Other” building types"}
          </p>
        </div>

        {/* Both periods, side by side. */}
        <div className="grid grid-cols-1 divide-line sm:grid-cols-2 sm:divide-x">
          <PeriodCell
            heading="2024–2029 (today)"
            penalty={result.period1.annualPenalty}
            over={result.period1.overTons}
          />
          <PeriodCell
            heading="2030–2034"
            penalty={result.period2.annualPenalty}
            over={result.period2.overTons}
            emphasize
          />
        </div>

        {/* 10-year cumulative exposure. */}
        <div className="border-t border-line bg-card px-6 py-8 sm:px-10">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="stamp-label text-muted">
                10-year cumulative exposure · 2026–2035
              </div>
              <p className="mt-1 max-w-md text-sm text-muted">
                What doing nothing adds up to, assuming flat usage.
              </p>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-stamp tnum sm:text-4xl">
              {formatDollars(result.cumulative2026to2035)}
            </div>
          </div>
        </div>

        {/* Emissions vs cap, the working. */}
        <div className="grid grid-cols-2 gap-px border-t border-line bg-line text-sm sm:grid-cols-4">
          <Fact label="Your emissions" value={`${formatNumber(result.emissionsTons, 1)} tCO₂e`} />
          <Fact label={`2030 cap · ${typeMeta.code}`} value={`${formatNumber(result.period2.capTons, 1)} tCO₂e`} />
          <Fact label="Over cap (2030)" value={`${formatNumber(result.period2.overTons, 1)} tCO₂e`} />
          <Fact label="Fine rate" value="$268 / tCO₂e" />
        </div>

        {/* Report gate. */}
        <ReportGate result={result} />

        <p className="px-6 py-4 text-xs leading-relaxed text-muted sm:px-10">
          Estimates based on published LL97 coefficients and limits. Actual
          obligations depend on your building&rsquo;s specific characteristics,
          adjustments, and credits. This is not legal or engineering advice.
        </p>
      </div>
    </div>
  );
}

function PeriodCell({
  heading,
  penalty,
  over,
  emphasize,
}: {
  heading: string;
  penalty: number;
  over: number;
  emphasize?: boolean;
}) {
  return (
    <div className="px-6 py-6 sm:px-10">
      <div className="stamp-label text-muted">{heading}</div>
      <div
        className={`mt-2 font-extrabold tracking-tight tnum ${
          emphasize ? "text-stamp text-3xl sm:text-4xl" : "text-ink text-2xl sm:text-3xl"
        }`}
      >
        {formatDollars(penalty)}
        <span className="text-sm font-normal text-muted"> / yr</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {over > 0
          ? `${formatNumber(over, 1)} tCO₂e over your cap`
          : "under your cap — no penalty this period"}
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper px-4 py-3">
      <div className="text-[0.68rem] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 font-semibold text-ink tnum">{value}</div>
    </div>
  );
}

/* ---------- Report gate ---------- */

function ReportGate({ result }: { result: PenaltyResult }) {
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email so we can send your report.");
      return;
    }
    setError("");
    setSubmitting(true);
    await captureLead({
      email: email.trim(),
      buildingAddress: address.trim() || undefined,
      source: "report_gate",
      context: {
        buildingType: result.type,
        sqft: result.sqft,
        penalty2030: Math.round(result.period2.annualPenalty),
        cumulative: Math.round(result.cumulative2026to2035),
      },
    });
    track("report_gate_submitted", {
      building_type: result.type,
      penalty_2030: Math.round(result.period2.annualPenalty),
    });
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="border-t border-line bg-card px-6 py-8 sm:px-10">
        <div className="stamp-label text-stamp">
          <span className="h-2 w-2 rounded-full bg-stamp" aria-hidden="true" />
          Received
        </div>
        <p className="mt-2 max-w-lg text-ink">
          Your full breakdown — with the filing deadlines you&rsquo;re on the hook
          for — is on its way within one business day. We send it by hand while
          we onboard early buildings, so keep an eye on your inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-line bg-card px-6 py-8 sm:px-10"
    >
      <div className="stamp-label text-stamp">
        <span className="h-2 w-2 rounded-full bg-stamp" aria-hidden="true" />
        Get the full breakdown — free
      </div>
      <p className="mt-2 max-w-lg text-ink">
        Get the full breakdown for your building — including the filing deadlines
        you&rsquo;re on the hook for. We send it within one business day.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            aria-invalid={Boolean(error)}
            className="w-full rounded-md border border-line bg-paper px-3 py-3 text-ink outline-none"
          />
        </label>
        <label className="block">
          <span className="sr-only">Building address (optional)</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Building address (optional)"
            className="w-full rounded-md border border-line bg-paper px-3 py-3 text-ink outline-none"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-stampInk">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-md bg-stamp px-6 py-3.5 font-bold text-white transition-colors hover:bg-stampInk disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Sending…" : "Email me the full report"}
      </button>
    </form>
  );
}

/* ---------- Below-threshold path ---------- */

function BelowThreshold({ sqft, type }: { sqft: number; type: BuildingType }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email and we'll alert you.");
      return;
    }
    setError("");
    await captureLead({
      email: email.trim(),
      source: "below_threshold",
      context: { buildingType: type, sqft },
    });
    track("below_threshold_lead", { sqft });
    setDone(true);
  }

  return (
    <div className="mt-12 rounded-lg border border-line bg-paper p-6 shadow-doc sm:p-8">
      <div className="stamp-label text-muted">Likely below the threshold</div>
      <p className="mt-2 max-w-xl text-ink">
        At {formatNumber(sqft)} sq ft, your building is likely below LL97&rsquo;s
        25,000 sq ft threshold — but thresholds tend to ratchet down. Leave your
        email and we&rsquo;ll alert you if that changes.
      </p>
      {done ? (
        <p className="mt-4 text-ink">
          Done — we&rsquo;ll be in touch if the threshold moves your way.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-md border border-line bg-card px-3 py-3 text-ink outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-stamp px-6 py-3 font-bold text-white transition-colors hover:bg-stampInk"
          >
            Alert me
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-stampInk">{error}</p>}
    </div>
  );
}
