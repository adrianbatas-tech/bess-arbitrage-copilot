import { cn } from "@/lib/utils";
import { SCENARIOS } from "@/lib/scenario";

export default function ScenarioSelector({ value, onChange }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-[1.125rem] font-semibold text-[#1F4E3D]">Price scenario</h2>
      <p className="mt-0.5 text-xs text-[#4A5568]">
        Widens or narrows each day&apos;s hourly spread around its mean.
      </p>
      <div
        role="group"
        aria-label="Price scenario"
        className="mt-3 grid grid-cols-3 gap-1 rounded-md bg-[#F4F6F5] p-1"
      >
        {SCENARIOS.map((scenario) => {
          const active = scenario.id === value;
          return (
            <button
              key={scenario.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(scenario.id)}
              className={cn(
                "min-h-[44px] rounded px-1.5 py-2 text-center transition-colors",
                active
                  ? "bg-[#C9A227] text-[#0F2A21] shadow-sm"
                  : "text-[#4A5568] hover:bg-white"
              )}
            >
              <span className="block text-[0.8125rem] font-semibold leading-tight">
                {scenario.label}
              </span>
              <span className="mt-0.5 block text-xs leading-tight">{scenario.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}