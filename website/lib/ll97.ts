/**
 * NYC Local Law 97 penalty math.
 *
 * All coefficients and limits are the published LL97 values from the site
 * brief. Emissions are in metric tons of CO2-equivalent (tCO2e). Penalties are
 * $268 per tCO2e over the applicable cap.
 *
 * Nothing here touches the network or the DOM — pure functions so the numbers
 * are trivially testable and the calculator can run fully client-side.
 */

export const PENALTY_PER_TON = 268;

/** kBtu conversions for fuels the brief lets users enter in their native unit. */
const KBTU_PER_THERM = 100;
const KBTU_PER_FUEL_OIL_GALLON = 138;
const KBTU_PER_STEAM_MLB = 1194;

/** tCO2e emission coefficients (per the brief). */
const COEFFICIENTS = {
  electricityPerKwh: 0.000288962,
  naturalGasPerKbtu: 0.00005311,
  fuelOilPerKbtu: 0.00007421,
  districtSteamPerKbtu: 0.00004493,
} as const;

export type BuildingType =
  | "multifamily"
  | "office"
  | "retail"
  | "hotel"
  | "other";

interface BuildingCaps {
  label: string;
  /** Occupancy group, e.g. "R-2", for the municipal flavor. */
  code: string;
  /** tCO2e per sq ft, 2024–2029 compliance period. */
  period1: number;
  /** tCO2e per sq ft, 2030–2034 compliance period. */
  period2: number;
  /** "Other" borrows Office limits; results are flagged approximate. */
  approximate?: boolean;
}

export const BUILDING_TYPES: Record<BuildingType, BuildingCaps> = {
  multifamily: { label: "Multifamily", code: "R-2", period1: 0.00675, period2: 0.00407 },
  office: { label: "Office", code: "B", period1: 0.00846, period2: 0.00453 },
  retail: { label: "Retail", code: "M", period1: 0.01181, period2: 0.00403 },
  hotel: { label: "Hotel", code: "R-1", period1: 0.00987, period2: 0.00526 },
  other: {
    label: "Other",
    code: "B",
    period1: 0.00846,
    period2: 0.00453,
    approximate: true,
  },
};

/** LL97 covers most buildings over this gross floor area. */
export const LL97_SQFT_THRESHOLD = 25000;

export interface EnergyInput {
  electricityKwh: number;
  naturalGasTherms: number;
  fuelOilGallons: number;
  districtSteamMlbs: number;
}

/**
 * Typical annual energy use for a "building like mine", scaled per sq ft so the
 * defaults track the entered floor area. Intensities are rough, brief-level
 * stand-ins meant to produce believable numbers, not audited benchmarks.
 */
const TYPICAL_INTENSITY: Record<
  BuildingType,
  { kwh: number; therms: number; fuelOil: number; steam: number }
> = {
  // per sq ft per year — calibrated so a typical building lands over its 2030
  // cap (matching the worked example: a 50k sq ft multifamily ≈ $5.9k today,
  // ≈ $42k from 2030).
  multifamily: { kwh: 5.0, therms: 1.08, fuelOil: 0, steam: 0 },
  office: { kwh: 18.0, therms: 0.3, fuelOil: 0, steam: 0 },
  retail: { kwh: 16.0, therms: 0.26, fuelOil: 0, steam: 0 },
  hotel: { kwh: 11.0, therms: 0.85, fuelOil: 0, steam: 0 },
  other: { kwh: 14.0, therms: 0.3, fuelOil: 0, steam: 0 },
};

export function typicalEnergyFor(type: BuildingType, sqft: number): EnergyInput {
  const t = TYPICAL_INTENSITY[type] ?? TYPICAL_INTENSITY.other;
  const area = sqft > 0 ? sqft : 0;
  return {
    electricityKwh: Math.round(t.kwh * area),
    naturalGasTherms: Math.round(t.therms * area),
    fuelOilGallons: Math.round(t.fuelOil * area),
    districtSteamMlbs: Math.round(t.steam * area),
  };
}

/** Total annual emissions (tCO2e) from the entered energy use. */
export function annualEmissions(energy: EnergyInput): number {
  const electricity = energy.electricityKwh * COEFFICIENTS.electricityPerKwh;
  const gas =
    energy.naturalGasTherms * KBTU_PER_THERM * COEFFICIENTS.naturalGasPerKbtu;
  const oil =
    energy.fuelOilGallons *
    KBTU_PER_FUEL_OIL_GALLON *
    COEFFICIENTS.fuelOilPerKbtu;
  const steam =
    energy.districtSteamMlbs *
    KBTU_PER_STEAM_MLB *
    COEFFICIENTS.districtSteamPerKbtu;
  return electricity + gas + oil + steam;
}

export interface PeriodResult {
  capTons: number;
  overTons: number;
  annualPenalty: number;
}

export interface PenaltyResult {
  type: BuildingType;
  approximate: boolean;
  sqft: number;
  emissionsTons: number;
  period1: PeriodResult; // 2024–2029
  period2: PeriodResult; // 2030–2034
  /** Cumulative exposure across 2026–2035, assuming flat usage. */
  cumulative2026to2035: number;
}

function periodResult(emissionsTons: number, capPerSqft: number, sqft: number): PeriodResult {
  const capTons = capPerSqft * sqft;
  const overTons = Math.max(0, emissionsTons - capTons);
  return {
    capTons,
    overTons,
    annualPenalty: overTons * PENALTY_PER_TON,
  };
}

/**
 * 10-year cumulative exposure, 2026–2035, assuming flat usage.
 * 2026–2029 (4 yrs) sit under the 2024–2029 cap; 2030–2035 (6 yrs) sit under
 * the 2030–2034 cap (later caps aren't published in the brief, so the 2030 cap
 * is carried forward — a conservative floor, not a ceiling).
 */
function cumulativeExposure(p1: PeriodResult, p2: PeriodResult): number {
  return p1.annualPenalty * 4 + p2.annualPenalty * 6;
}

export function computePenalty(
  type: BuildingType,
  sqft: number,
  energy: EnergyInput,
): PenaltyResult {
  const caps = BUILDING_TYPES[type] ?? BUILDING_TYPES.other;
  const emissionsTons = annualEmissions(energy);
  const period1 = periodResult(emissionsTons, caps.period1, sqft);
  const period2 = periodResult(emissionsTons, caps.period2, sqft);
  return {
    type,
    approximate: Boolean(caps.approximate),
    sqft,
    emissionsTons,
    period1,
    period2,
    cumulative2026to2035: cumulativeExposure(period1, period2),
  };
}

/** Whole-dollar currency, no cents — figures this size don't need them. */
export function formatDollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}
