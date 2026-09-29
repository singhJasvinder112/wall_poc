"use client";

import { useState } from "react";
import { Coins, LayoutGrid, ShieldAlert, Wrench } from "lucide-react";
import type { WallAnalysis } from "@/lib/wall-analysis-schema";
import {
  SEVERITY_ICON,
  SEVERITY_ORDER,
  SEVERITY_RAMP,
  compactAed,
  totalCostAed,
  isSeverity,
  type Severity,
} from "@/lib/damage-tokens";

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-2xl font-semibold text-slate-900 dark:text-white">
        {value}
      </span>
      {hint && (
        <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>
      )}
    </div>
  );
}

export default function BatchSummary({ analyses }: { analyses: WallAnalysis[] }) {
  const [hovered, setHovered] = useState<Severity | null>(null);

  if (analyses.length === 0) return null;

  const counts: Record<Severity, number> = { minor: 0, moderate: 0, severe: 0 };
  let totalIssues = 0;
  let costLow = 0;
  let costHigh = 0;
  let costed = 0;
  let outside = 0;

  for (const a of analyses) {
    totalIssues += a.issues.length;
    if (a.overallAqlStatus === "outside_aql") outside += 1;
    for (const issue of a.issues) {
      if (isSeverity(issue.severity)) counts[issue.severity] += 1;
    }
    const total = totalCostAed({
      issues: a.issues,
      estimatedRepairCostAed: a.estimatedRepairCostAed,
    });
    if (total) {
      costLow += total.low;
      costHigh += total.high;
      costed += 1;
    }
  }

  const attention = counts.moderate + counts.severe;
  const present = SEVERITY_ORDER.filter((s) => counts[s] > 0);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
        This inspection batch
      </h2>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Surfaces inspected"
          value={analyses.length.toLocaleString()}
          icon={LayoutGrid}
        />
        <StatTile
          label="SAQL findings"
          value={totalIssues.toLocaleString()}
          hint={`${outside} outside SAQL`}
          icon={Wrench}
        />
        <StatTile
          label="Needing attention"
          value={attention.toLocaleString()}
          hint="Moderate or severe"
          icon={ShieldAlert}
        />
        <StatTile
          label="Est. rectification"
          value={costed === 0 ? "—" : `${compactAed(costLow)}–${compactAed(costHigh)}`}
          icon={Coins}
        />
      </div>

      {totalIssues > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
              Severity mix
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {hovered
                ? `${hovered} · ${counts[hovered]} of ${totalIssues}`
                : `${totalIssues} finding${totalIssues === 1 ? "" : "s"}`}
            </span>
          </div>
          <div
            className="flex h-5 w-full gap-[2px] overflow-hidden rounded-[4px]"
            onMouseLeave={() => setHovered(null)}
          >
            {present.map((s) => (
              <div
                key={s}
                role="presentation"
                onMouseEnter={() => setHovered(s)}
                style={{
                  backgroundColor: SEVERITY_RAMP[s],
                  flexBasis: `${(counts[s] / totalIssues) * 100}%`,
                  opacity: hovered && hovered !== s ? 0.45 : 1,
                }}
                className="h-full min-w-[3px] shrink-0 transition-opacity first:rounded-l-[4px] last:rounded-r-[4px]"
              />
            ))}
          </div>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {SEVERITY_ORDER.map((s) => {
              const Icon = SEVERITY_ICON[s];
              return (
                <li
                  key={s}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: SEVERITY_RAMP[s] }}
                  />
                  <Icon className="size-3.5 text-slate-400" />
                  <span className="capitalize">{s}</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                    {counts[s]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
