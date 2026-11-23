import { History } from "lucide-react";
import { formatNumber, formatRunTime } from "@/lib/format";
import { scenarioLabel } from "@/lib/scenario";

export default function RunHistory({ runs, loading, activeId, onSelect }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-[1.125rem] font-semibold text-[#1F4E3D]">
          <History aria-hidden="true" className="h-4 w-4 text-[#C9A227]" />
          Session history
        </h2>
        <p className="text-xs text-[#4A5568]">Last 10 runs in this browser. Click a row to restore.</p>
      </header>

      {loading ? (
        <p className="mt-3 rounded-md border border-slate-200 px-3 py-6 text-center text-sm text-[#4A5568]">
          Loading runs…
        </p>
      ) : runs.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-[#4A5568]">
          No saved runs yet. Each Calculate saves a record to this browser&apos;s session.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Time
                </th>
                <th className="py-2 pr-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Scenario
                </th>
                <th className="py-2 pr-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  IRR
                </th>
                <th className="py-2 pr-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  NPV (PHP M)
                </th>
                <th className="py-2 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  Memo
                </th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const active = run.id === activeId;
                return (
                  <tr
                    key={run.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Restore ${scenarioLabel(run.scenario)} run`}
                    onClick={() => onSelect(run)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(run);
                      }
                    }}
                    className={`cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-[#F4F6F5] ${
                      active ? "bg-[#FBF6E4]" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3 text-[#4A5568]">{formatRunTime(run.created_date)}</td>
                    <td className="py-2.5 pr-3 font-medium text-[#1F4E3D]">
                      {scenarioLabel(run.scenario)}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-[#1F4E3D]">
                      {run.results && run.results.irr !== null && run.results.irr !== undefined
                        ? `${formatNumber(run.results.irr * 100, 1)}%`
                        : "n/a"}
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-[#1F4E3D]">
                      {run.results && typeof run.results.npv === "number"
                        ? formatNumber(run.results.npv / 1_000_000, 1)
                        : "n/a"}
                    </td>
                    <td className="py-2.5 text-right text-xs text-[#6B7280]">
                      {run.ai_status === "ok" ? "yes" : run.ai_status === "error" ? "failed" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}