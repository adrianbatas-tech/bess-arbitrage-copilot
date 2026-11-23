import { useEffect, useId, useState } from "react";
import { formatNumber } from "@/lib/format";

const DOTS = [
  { cx: 14, cy: 14, delay: "0.54s" },
  { cx: 38, cy: 14, delay: "0.36s" },
  { cx: 62, cy: 14, delay: "0.18s" },
  { cx: 86, cy: 14, delay: "0s" },
  { cx: 38, cy: 38, delay: "0.54s" },
  { cx: 62, cy: 38, delay: "0.36s" },
  { cx: 86, cy: 38, delay: "0.18s" },
  { cx: 62, cy: 62, delay: "0.54s" },
  { cx: 86, cy: 62, delay: "0.36s" },
  { cx: 86, cy: 86, delay: "0.54s" },
];

function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(target === null || target === undefined ? null : 0);

  useEffect(() => {
    if (target === null || target === undefined || Number.isNaN(target)) {
      setValue(null);
      return undefined;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return undefined;
    }
    let frame;
    let start;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(target * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function KpiCard({ title, numeric, decimals = 0, suffix = "", details = [] }) {
  const animated = useCountUp(numeric);
  const grainId = `kpi-grain-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <article className="relative flex flex-col justify-between gap-5 overflow-hidden rounded-md border border-slate-200 border-t-2 border-t-[#C9A227] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,rgba(201,162,39,0.18)_0%,rgba(201,162,39,0.06)_38%,rgba(201,162,39,0)_72%)]"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30 mix-blend-overlay"
      >
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.25" intercept="-0.12" />
            <feFuncG type="linear" slope="1.25" intercept="-0.12" />
            <feFuncB type="linear" slope="1.25" intercept="-0.12" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>

      <div className="relative flex items-start justify-between gap-2">
        <h3 className="text-[0.8125rem] font-semibold leading-snug text-[#4A5568]">{title}</h3>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="h-7 w-7 shrink-0 fill-[#C9A227]"
        >
          {DOTS.map((dot) => (
            <circle
              key={`${dot.cx}-${dot.cy}`}
              className="kpi-dot"
              style={{ "--kpi-d": dot.delay }}
              cx={dot.cx}
              cy={dot.cy}
              r="9"
            />
          ))}
        </svg>
      </div>

      <div className="relative">
        <p className="flex items-start font-display text-[clamp(1.5rem,2.1vw,2.1rem)] font-bold leading-none tracking-tight text-[#1F4E3D] [font-feature-settings:'tnum'_1,'lnum'_1]">
          {animated === null ? "n/a" : formatNumber(animated, decimals)}
          {suffix ? <span className="ml-0.5 mt-1 text-[0.42em] font-semibold">{suffix}</span> : null}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {details.map((detail) => (
            <div key={detail.label} className="min-w-0">
              <dt className="text-xs leading-tight text-[#6B7280]">{detail.label}</dt>
              <dd className="text-xs font-semibold leading-tight text-[#1F4E3D]">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}