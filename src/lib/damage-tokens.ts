import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

export type Severity = "minor" | "moderate" | "severe";
export type Condition = "excellent" | "good" | "fair" | "poor";

export const SEVERITY_RAMP: Record<Severity, string> = {
  minor: "#fb9856",
  moderate: "#ef6306",
  severe: "#953e04",
};

export const SEVERITY_ORDER: Severity[] = ["minor", "moderate", "severe"];

export const SEVERITY_ICON: Record<Severity, LucideIcon> = {
  minor: CircleDot,
  moderate: AlertTriangle,
  severe: AlertOctagon,
};

const STATUS = {
  good: "#0ca30c",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export const CONDITION_COLOR: Record<Condition, string> = {
  excellent: STATUS.good,
  good: STATUS.good,
  fair: STATUS.serious,
  poor: STATUS.critical,
};

export const CONDITION_ICON: Record<Condition, LucideIcon> = {
  excellent: CheckCircle2,
  good: CheckCircle2,
  fair: AlertTriangle,
  poor: AlertOctagon,
};

export function isSeverity(v: string): v is Severity {
  return v === "minor" || v === "moderate" || v === "severe";
}

export function isCondition(v: string): v is Condition {
  return v === "excellent" || v === "good" || v === "fair" || v === "poor";
}

type CostRange = { low: number; high: number } | null | undefined;

export type CostTotal = {
  low: number;
  high: number;
  costed: number;
  items: number;
  basis: "itemised" | "overall";
};

export function totalCostAed(result: {
  issues?: { estimatedCostAed?: CostRange }[];
  estimatedRepairCostAed?: CostRange;
}): CostTotal | null {
  let low = 0;
  let high = 0;
  let costed = 0;
  const items = (result.issues ?? []).length;

  for (const d of result.issues ?? []) {
    if (d?.estimatedCostAed) {
      low += d.estimatedCostAed.low;
      high += d.estimatedCostAed.high;
      costed += 1;
    }
  }

  if (costed > 0) return { low, high, costed, items, basis: "itemised" };

  const overall = result.estimatedRepairCostAed;
  if (overall) return { ...overall, costed: 0, items, basis: "overall" };

  return null;
}

const AED_FORMAT = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });

export function formatAed(n: number): string {
  return AED_FORMAT.format(Math.round(n));
}

export function compactAed(n: number): string {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `AED ${(n / 1000).toFixed(1)}K`;
  return `AED ${formatAed(n)}`;
}
