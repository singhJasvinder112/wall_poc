"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Database, Search } from "lucide-react";
import type { WallAnalysisRecord } from "@/lib/db";
import InspectionResult from "@/components/InspectionResult";
import { AqlStatusBadge, ConditionBadge } from "@/components/Badges";
import { compactAed, totalCostAed } from "@/lib/damage-tokens";

export default function HistoryView({
  history,
  configured,
  failed,
  openId = null,
}: {
  history: WallAnalysisRecord[];
  configured: boolean;
  failed: boolean;
  openId?: number | null;
}) {
  const [query, setQuery] = useState("");
  const [openRecord, setOpenRecord] = useState<number | null>(openId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((r) => {
      const area = r.result?.roomOrArea ?? "";
      return (
        r.fileName.toLowerCase().includes(q) ||
        area.toLowerCase().includes(q) ||
        (r.result?.surfaceType ?? "").toLowerCase().includes(q) ||
        r.overallCondition.toLowerCase().includes(q)
      );
    });
  }, [history, query]);

  if (!configured) {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        <Database className="mt-0.5 size-4 shrink-0 text-slate-400" />
        <p>
          History is off — no database is connected. Inspections still run;
          they are just not saved.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Inspection history
          <span className="ml-2 font-normal text-slate-400 dark:text-slate-500">
            {history.length} record{history.length === 1 ? "" : "s"}
          </span>
        </h2>
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search area, zone, file…"
            className="w-56 rounded-full border border-slate-200 bg-white py-1.5 pr-3 pl-8 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#ef6306] focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-slate-200"
          />
        </label>
      </div>

      {failed && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          Could not load history right now. Inspection itself is unaffected.
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          No matching inspections.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((entry) => {
            const open = openRecord === entry.id;
            const total = totalCostAed({
              issues: entry.result?.issues,
              estimatedRepairCostAed: entry.result?.estimatedRepairCostAed,
            });
            return (
              <li
                key={entry.id}
                className="rounded-xl border border-slate-200 dark:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => setOpenRecord(open ? null : entry.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {entry.result?.roomOrArea ?? entry.fileName}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(entry.createdAt).toLocaleString("en-AE")} ·{" "}
                      {entry.issuesCount} finding
                      {entry.issuesCount === 1 ? "" : "s"}
                      {total
                        ? ` · ${compactAed(total.low)}–${compactAed(total.high)}`
                        : ""}
                    </p>
                  </div>
                  <ConditionBadge condition={entry.overallCondition} />
                  {entry.result?.overallAqlStatus && (
                    <AqlStatusBadge status={entry.result.overallAqlStatus} />
                  )}
                  <ChevronDown
                    className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && entry.result && (
                  <div className="border-t border-slate-200 px-4 py-4 dark:border-white/10">
                    <InspectionResult
                      result={entry.result}
                      fileName={entry.fileName}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
