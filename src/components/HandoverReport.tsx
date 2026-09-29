"use client";

import { useMemo, useRef, useState } from "react";
import { Check, CircleHelp, Printer, TriangleAlert } from "lucide-react";
import type { WallAnalysis } from "@/lib/wall-analysis-schema";
import {
  WALL_HANDOVER_SECTIONS,
  WALL_ISSUE_MARKS,
  type CheckEvidence,
} from "@/lib/wall-handover-checklist";
import {
  SEVERITY_RAMP,
  formatAed,
  isSeverity,
  totalCostAed,
} from "@/lib/damage-tokens";

type Status = "good" | "attention" | "not_assessable";

type Resolved = {
  status: Status;
  remark: string | null;
  fromAi: boolean;
  evidence: CheckEvidence;
};

type HeaderFields = {
  propertyUnitNo: string;
  inspectedBy: string;
  contactName: string;
  contactPhone: string;
};

function StatusMark({ status }: { status: Status }) {
  if (status === "good") {
    return (
      <span
        title="Good"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-emerald-600/40 bg-emerald-50 text-emerald-700"
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === "attention") {
    return (
      <span
        title="Needs attention"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-red-600/40 bg-red-50 text-red-700"
      >
        <TriangleAlert className="size-3" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span
      title="Not assessable from the supplied media"
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-slate-300 bg-slate-50 text-slate-400"
    >
      <CircleHelp className="size-3" strokeWidth={2.5} />
    </span>
  );
}

export default function HandoverReport({
  result,
  fileName,
}: {
  result: WallAnalysis;
  fileName: string;
}) {
  const formRef = useRef<HTMLDivElement>(null);
  const meta = result.handover ?? null;
  const [header, setHeader] = useState<HeaderFields>({
    propertyUnitNo: meta?.propertyUnitNo ?? "",
    inspectedBy: meta?.inspectedBy ?? "",
    contactName: meta?.contactName ?? "",
    contactPhone: meta?.contactPhone ?? "",
  });

  const resolved = useMemo(() => {
    const byId = new Map<string, { status: Status; remark: string | null }>();
    for (const entry of result.checklist ?? []) {
      if (!entry?.itemId) continue;
      byId.set(entry.itemId, {
        status: entry.status,
        remark: entry.remark ?? null,
      });
    }

    const map = new Map<string, Resolved>();
    for (const section of WALL_HANDOVER_SECTIONS) {
      for (const item of section.items) {
        const hit = byId.get(item.id);
        if (item.evidence === "manual") {
          map.set(item.id, {
            status: "not_assessable",
            remark: null,
            fromAi: false,
            evidence: item.evidence,
          });
          continue;
        }
        map.set(item.id, {
          status: hit ? hit.status : "not_assessable",
          remark: hit?.remark ?? null,
          fromAi: Boolean(hit),
          evidence: item.evidence,
        });
      }
    }
    return map;
  }, [result.checklist]);

  const counts = useMemo(() => {
    let good = 0;
    let attention = 0;
    let pending = 0;
    for (const r of resolved.values()) {
      if (r.status === "good") good++;
      else if (r.status === "attention") attention++;
      else pending++;
    }
    return { good, attention, pending, total: resolved.size };
  }, [resolved]);

  const stampedAt = useMemo(() => new Date().toLocaleString("en-AE"), []);

  const metaRecordNo = meta?.recordNo ?? null;
  const recordNo = useMemo(() => {
    if (metaRecordNo) return metaRecordNo;
    let h = 0;
    for (const ch of fileName) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return String(h).padStart(10, "0").slice(0, 10);
  }, [metaRecordNo, fileName]);

  const zoneLabel = result.surfaceType
    ? result.surfaceType.replaceAll("_", " ")
    : "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs dark:border-white/10 dark:bg-white/5">
        <span className="font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          AI coverage
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <StatusMark status="good" /> {counts.good} good
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <StatusMark status="attention" /> {counts.attention} need attention
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <StatusMark status="not_assessable" /> {counts.pending} to check by hand
        </span>
        <button
          type="button"
          onClick={() => {
            const el = formRef.current;
            if (!el) return;
            el.classList.add("print-target");
            const clear = () => {
              el.classList.remove("print-target");
              window.removeEventListener("afterprint", clear);
            };
            window.addEventListener("afterprint", clear);
            window.print();
          }}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 print:hidden dark:border-white/20 dark:text-slate-300"
        >
          <Printer className="size-3.5" />
          Save as PDF
        </button>
      </div>

      <div
        ref={formRef}
        className="overflow-hidden rounded-xl border border-slate-300 bg-white text-slate-900"
      >
        {!result.surfaceDetected && (
          <p className="border-b border-red-300 bg-red-50 px-4 py-2 text-[11px] font-semibold text-red-800">
            No painted surface or silicone joint was clearly identified. This
            form is not a valid handover record — re-shoot before using it.
          </p>
        )}

        <div className="flex flex-col items-center gap-1 border-b-2 border-slate-900 px-5 py-4 text-center">
          <span className="flex w-full items-baseline justify-between gap-3">
            <span className="text-sm font-semibold tracking-[0.2em] text-slate-900">
              SOBHA
            </span>
            <span className="text-[11px] text-slate-600">
              Record: <span className="font-semibold">{recordNo}</span>
            </span>
          </span>
          <h3 className="text-sm font-semibold tracking-wide text-blue-800 uppercase">
            Paint &amp; Silicon SAQL Handover / Takeover Acknowledgement
          </h3>
          <p className="text-base font-bold tracking-wide text-blue-900 uppercase">
            Handover
          </p>
          <p className="text-[10px] text-slate-500">
            Refs: SCL-SAQL-001 (Paint) · SCL-SAQL-002 (Silicon Application)
          </p>
        </div>

        <dl className="grid grid-cols-1 border-b border-slate-300 sm:grid-cols-3">
          <Field label="Zone" value={zoneLabel} aiRead />
          <Field label="Domain" value={result.domain} aiRead />
          <Field label="Room / Area" value={result.roomOrArea} aiRead />
          <Field label="Date & Time" value={stampedAt} />
          <Field
            label="Overall SAQL"
            value={
              result.overallAqlStatus === "within_aql"
                ? "Within SAQL"
                : result.overallAqlStatus === "outside_aql"
                  ? "Outside SAQL"
                  : "Needs measurement"
            }
            aiRead
          />
          <EditableField
            label="Property / Unit No"
            value={header.propertyUnitNo}
            placeholder="e.g. Villa 12"
            onChange={(v) => setHeader((h) => ({ ...h, propertyUnitNo: v }))}
          />
          <EditableField
            label="Inspected By"
            value={header.inspectedBy}
            placeholder="Full name"
            onChange={(v) => setHeader((h) => ({ ...h, inspectedBy: v }))}
          />
          <EditableField
            label="Contact Name"
            value={header.contactName}
            placeholder="Full name"
            onChange={(v) => setHeader((h) => ({ ...h, contactName: v }))}
          />
          <EditableField
            label="Contact Phone"
            value={header.contactPhone}
            placeholder="Contact number"
            onChange={(v) => setHeader((h) => ({ ...h, contactPhone: v }))}
          />
          <Field label="Source file" value={fileName} />
        </dl>

        <p className="border-b border-slate-200 px-4 py-2 text-[11px] text-slate-600">
          <span className="font-semibold">Instructions:</span> Mark SAQL
          defects on schedule. Check each item: ✓ good, ! needs attention, ?
          not assessable from the supplied media. mm-limit items require
          feeler gauge / German scale on site.
        </p>

        <div className="flex flex-col">
          {WALL_HANDOVER_SECTIONS.map((section) => {
            const remarks = section.items
              .map((i) => ({ item: i, r: resolved.get(i.id) }))
              .filter((x) => x.r?.status === "attention" && x.r?.remark);

            return (
              <section
                key={section.id}
                className="border-b border-slate-200 px-4 py-3 last:border-b-0"
              >
                <h4 className="mb-2 text-[13px] font-bold text-slate-900">
                  {section.number}. {section.title}
                </h4>
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {section.items.map((item) => {
                    const r = resolved.get(item.id);
                    if (!r) return null;
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-1.5 text-[12px] text-slate-800"
                      >
                        <StatusMark status={r.status} />
                        <span
                          className={
                            r.status === "attention" ? "font-semibold" : ""
                          }
                        >
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2 border-t border-dotted border-slate-300 pt-1.5 text-[11px] text-slate-600">
                  <span className="font-semibold">Remarks:</span>{" "}
                  {remarks.length === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    remarks
                      .map((x) => `${x.item.label}: ${x.r?.remark}`)
                      .join("; ")
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <section className="border-t-2 border-slate-900 px-4 py-3">
          <h4 className="mb-2 text-[13px] font-bold text-slate-900">
            SAQL Issue Schedule
          </h4>
          {result.issues.length === 0 ? (
            <p className="text-[12px] text-slate-500">
              No SAQL defects recorded in this inspection.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                    <th className="py-1 pr-2 font-semibold">Mark</th>
                    <th className="py-1 pr-2 font-semibold">Location</th>
                    <th className="py-1 pr-2 font-semibold">Defect</th>
                    <th className="py-1 pr-2 font-semibold">Verdict</th>
                    <th className="py-1 pr-2 font-semibold">Limit</th>
                    <th className="py-1 font-semibold">Est. cost (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.issues.map((issue, i) => {
                    const markInfo =
                      (issue.aqlDefectId &&
                        WALL_ISSUE_MARKS[issue.aqlDefectId]) ||
                      WALL_ISSUE_MARKS.other;
                    const color = isSeverity(issue.severity)
                      ? SEVERITY_RAMP[issue.severity]
                      : "#64748b";
                    return (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1.5 pr-2">
                          <span
                            className="inline-flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {markInfo.mark}
                          </span>
                        </td>
                        <td className="py-1.5 pr-2 text-slate-800">
                          {issue.location}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-600">
                          {markInfo.label}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-600 capitalize">
                          {issue.aqlVerdict.replaceAll("_", " ")}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-600">
                          {issue.acceptanceLimit ?? "—"}
                        </td>
                        <td className="py-1.5 text-slate-800 tabular-nums">
                          {issue.estimatedCostAed
                            ? `${formatAed(issue.estimatedCostAed.low)} – ${formatAed(issue.estimatedCostAed.high)}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {(() => {
            const total = totalCostAed({
              issues: result.issues,
              estimatedRepairCostAed: result.estimatedRepairCostAed,
            });
            if (!total) return null;
            return (
              <p className="mt-3 text-[12px] font-semibold text-slate-900">
                Indicative rectification total: AED {formatAed(total.low)} – AED{" "}
                {formatAed(total.high)}
                <span className="ml-1 font-normal text-slate-500">
                  — indicative only
                </span>
              </p>
            );
          })()}
        </section>

        <div className="grid grid-cols-2 gap-6 border-t border-slate-300 px-4 py-5 text-[11px] text-slate-600">
          <div>
            <div className="h-8 border-b border-slate-400" />
            <span>Inspected by (signature)</span>
          </div>
          <div>
            <div className="h-8 border-b border-slate-400" />
            <span>Acknowledged by (signature)</span>
          </div>
        </div>

        <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-[10px] text-slate-500">
          Items marked &ldquo;check by hand&rdquo; could not be judged from the
          supplied media. AI-assisted pre-fill against SCL-SAQL-001 /
          SCL-SAQL-002 — not a substitute for physical QA/QC inspection.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  aiRead,
}: {
  label: string;
  value: string | null;
  aiRead?: boolean;
}) {
  return (
    <div className="border-r border-b border-slate-200 px-3 py-2 last:border-r-0">
      <dt className="text-[10px] tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900 capitalize">
        {value ? (
          <>
            <span className="truncate">{value}</span>
            {aiRead && (
              <span className="shrink-0 rounded-sm bg-[#ef6306]/15 px-1 text-[9px] font-bold tracking-wide text-[#a04304] uppercase">
                AI
              </span>
            )}
          </>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </dd>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="border-r border-b border-slate-200 px-3 py-2 last:border-r-0">
      <dt className="text-[10px] tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "—"}
          className="w-full bg-transparent text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none"
        />
      </dd>
    </div>
  );
}
