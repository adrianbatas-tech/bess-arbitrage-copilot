import KpiCard from "@/components/bess/KpiCard";
import { formatNumber } from "@/lib/format";
import { scenarioLabel } from "@/lib/scenario";

export default function ResultsGrid({ results, inputs, scenario }) {
  if (!results || !inputs) {
    return (
      <section className="rounded-md border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
        <h2 className="font-display text-[1.125rem] font-semibold text-[#1F4E3D]">
          No run yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#4A5568]">
          Set your battery and price scenario on the left, then run Calculate arbitrage to see
          annual margin, capex, NPV, IRR and payback.
        </p>
      </section>
    );
  }

  const label = scenarioLabel(scenario);
  const duration = (inputs.energyMWh / inputs.powerMW).toFixed(1);
  const irrAboveHurdle = results.irr !== null && results.irr >= inputs.discountRate;

  const cards = [
    {
      title: "Annual margin (PHP M)",
      numeric: results.annualMargin / 1_000_000,
      decimals: 1,
      details: [
        { label: "Scenario", value: label },
        { label: "Basis", value: "365 days" },
      ],
    },
    {
      title: "Capex (PHP M)",
      numeric: results.capex / 1_000_000,
      decimals: 1,
      details: [
        { label: "Unit capex", value: `PHP ${formatNumber(inputs.capexPhpPerKwh)}/kWh` },
        { label: "Energy", value: `${formatNumber(inputs.energyMWh)} MWh` },
      ],
    },
    {
      title: "NPV (PHP M)",
      numeric: results.npv / 1_000_000,
      decimals: 1,
      details: [
        { label: "Discount rate", value: `${formatNumber(inputs.discountRate * 100, 1)}%` },
        { label: "Horizon", value: `${formatNumber(inputs.years)} yrs` },
      ],
    },
    {
      title: "IRR",
      numeric: results.irr === null ? null : results.irr * 100,
      decimals: 1,
      suffix: results.irr === null ? "" : "%",
      details: [
        { label: "Hurdle", value: `${formatNumber(inputs.discountRate * 100, 1)}%` },
        {
          label: "Verdict",
          value: results.irr === null ? "n/a" : irrAboveHurdle ? "Above hurdle" : "Below hurdle",
        },
      ],
    },
    {
      title: "Payback (years)",
      numeric: results.paybackYears,
      decimals: 1,
      details: [
        { label: "Annual cash", value: `PHP ${formatNumber(results.annualCash / 1_000_000, 1)}M` },
        { label: "Fixed O&M", value: `PHP ${formatNumber(results.fixedOm / 1_000_000, 1)}M/yr` },
      ],
    },
  ];

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-[1.125rem] font-semibold text-[#1F4E3D]">Arbitrage economics</h2>
        <p className="text-xs text-[#4A5568]">
          {label} scenario · {formatNumber(inputs.years)} years · {duration} h duration ·{" "}
          {formatNumber(inputs.powerMW)} MW / {formatNumber(inputs.energyMWh)} MWh
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}