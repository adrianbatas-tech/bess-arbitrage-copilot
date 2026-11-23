import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/format";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const price = payload.find((entry) => entry.dataKey === "price")?.value;
  const isDischarge = payload.some((entry) => entry.dataKey === "discharge" && entry.value != null);
  const isCharge = payload.some((entry) => entry.dataKey === "charge" && entry.value != null);
  const role = isDischarge ? "Discharge hour" : isCharge ? "Charge hour" : "Idle hour";

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-[#1F4E3D]">{label}:00</p>
      <p className="text-xs text-[#4A5568]">
        PHP {formatNumber(price, 2)}/kWh · {role}
      </p>
    </div>
  );
}

function LegendSwatch({ color, label, variant = "dot" }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#4A5568]">
      <span
        aria-hidden="true"
        className={variant === "line" ? "h-0.5 w-4 rounded-full" : "h-2.5 w-2.5 rounded-sm"}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export default function DispatchChart({ avgPrices, chargeHours, dischargeHours }) {
  const data = useMemo(() => {
    const charge = new Set(chargeHours);
    const discharge = new Set(dischargeHours);
    return avgPrices.map((price, hour) => {
      const phpPerKwh = price / 1000;
      return {
        hour,
        price: phpPerKwh,
        charge: charge.has(hour) ? phpPerKwh : null,
        discharge: discharge.has(hour) ? phpPerKwh : null,
      };
    });
  }, [avgPrices, chargeHours, dischargeHours]);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-[1.125rem] font-semibold text-[#1F4E3D]">Dispatch profile</h2>
          <p className="mt-0.5 text-xs text-[#4A5568]">
            Annual average day, PHP/kWh. Cheapest hours charge, most expensive hours discharge.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LegendSwatch color="#1F4E3D" label="Charge" />
          <LegendSwatch color="#C9A227" label="Discharge" />
          <LegendSwatch color="#1F4E3D" label="Average price" variant="line" />
        </div>
      </header>

      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="hour"
              tickFormatter={(hour) => `${hour}`}
              interval={2}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fontSize: 11, fill: "#4A5568" }}
            />
            <YAxis
              tickFormatter={(value) => value.toFixed(1)}
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fontSize: 11, fill: "#4A5568" }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(31,78,61,0.05)" }} />
            <Bar dataKey="charge" fill="#1F4E3D" fillOpacity={0.26} barSize={10} isAnimationActive={false} />
            <Bar dataKey="discharge" fill="#C9A227" fillOpacity={0.5} barSize={10} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1F4E3D"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-3">
        <div>
          <dt className="text-xs text-[#6B7280]">Charge hours</dt>
          <dd className="text-sm font-semibold text-[#1F4E3D]">
            {chargeHours.map((h) => `${h}:00`).join(", ")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#6B7280]">Discharge hours</dt>
          <dd className="text-sm font-semibold text-[#1F4E3D]">
            {dischargeHours.map((h) => `${h}:00`).join(", ")}
          </dd>
        </div>
      </dl>
    </section>
  );
}