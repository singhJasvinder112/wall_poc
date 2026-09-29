import { AlertTriangle, CheckCircle2, Film, Ruler, Wrench } from "lucide-react";
import type { WallAnalysis } from "@/lib/wall-analysis-schema";
import { AqlStatusBadge, ConditionBadge, SeverityChip } from "@/components/Badges";
import {
  SEVERITY_ORDER,
  formatAed,
  isSeverity,
  totalCostAed,
} from "@/lib/damage-tokens";
import { WALL_ISSUE_MARKS } from "@/lib/wall-handover-checklist";

function bySeverityDesc(a: { severity: string }, b: { severity: string }) {
  const rank = (s: string) => (isSeverity(s) ? SEVERITY_ORDER.indexOf(s) : -1);
  return rank(b.severity) - rank(a.severity);
}

function verdictLabel(v: string) {
  if (v === "fail") return "Fail SAQL";
  if (v === "needs_measurement") return "Needs measurement";
  if (v === "pass") return "Pass";
  return v;
}

export function AnalysisDetails({ result }: { result: WallAnalysis }) {
  const issues = [...result.issues].sort(bySeverityDesc);
  const total = totalCostAed({
    issues: result.issues,
    estimatedRepairCostAed: result.estimatedRepairCostAed,
  });

  return (
    <div className="flex flex-col gap-5 border-t border-slate-200 pt-4 dark:border-white/10">
      {!result.surfaceDetected && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            No painted surface or silicone joint was clearly detected — results
            below may be unreliable.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
          Overall
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <ConditionBadge condition={result.overallCondition} />
          <AqlStatusBadge status={result.overallAqlStatus} />
        </div>
      </div>

      {(result.roomOrArea || result.surfaceType || result.domain) && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {result.roomOrArea && (
            <>
              <span className="text-slate-400 dark:text-slate-500">Area: </span>
              {result.roomOrArea}
              {" · "}
            </>
          )}
          {result.surfaceType && (
            <>
              <span className="text-slate-400 dark:text-slate-500">Zone: </span>
              <span className="capitalize">{result.surfaceType.replaceAll("_", " ")}</span>
              {" · "}
            </>
          )}
          {result.domain && (
            <>
              <span className="text-slate-400 dark:text-slate-500">Domain: </span>
              <span className="capitalize">{result.domain}</span>
            </>
          )}
        </p>
      )}

      <div>
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
          SAQL findings ({issues.length})
        </h3>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <p>No SAQL defects detected.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {issues.map((issue, i) => {
              const mark =
                (issue.aqlDefectId && WALL_ISSUE_MARKS[issue.aqlDefectId]) ||
                WALL_ISSUE_MARKS.other;
              return (
                <li
                  key={i}
                  className="flex flex-col gap-1.5 rounded-xl border border-slate-200 p-4 dark:border-white/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {issue.location}
                    </span>
                    <SeverityChip severity={issue.severity} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {issue.description}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {mark.label}
                    </span>
                    <span
                      className={
                        issue.aqlVerdict === "fail"
                          ? "font-semibold text-red-600 dark:text-red-400"
                          : issue.aqlVerdict === "needs_measurement"
                            ? "font-semibold text-amber-700 dark:text-amber-300"
                            : ""
                      }
                    >
                      {verdictLabel(issue.aqlVerdict)}
                    </span>
                    {issue.acceptanceLimit && (
                      <span className="flex items-center gap-1">
                        <Ruler className="size-3" />
                        {issue.acceptanceLimit}
                      </span>
                    )}
                    <span>Size: {issue.approximateSize}</span>
                    {issue.repairMethod && <span>{issue.repairMethod}</span>}
                    {issue.estimatedCostAed && (
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        AED {formatAed(issue.estimatedCostAed.low)}–
                        {formatAed(issue.estimatedCostAed.high)}
                      </span>
                    )}
                    {issue.timestamp && (
                      <span className="flex items-center gap-1">
                        <Film className="size-3" />
                        {issue.timestamp}
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {result.otherIssues.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
            Other observations
          </h3>
          <ul className="flex flex-col gap-1.5">
            {result.otherIssues.map((d, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-400" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          <Wrench className="size-3.5" />
          Recommendation
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {result.recommendation}
        </p>
        {total && (
          <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
            Estimated rectification: AED {formatAed(total.low)} – AED{" "}
            {formatAed(total.high)}
          </p>
        )}
      </div>
    </div>
  );
}
