import { Sparkles } from "lucide-react";

export default function SiteHeader({ aiCalls, aiLimit }) {
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none tracking-tight text-[#1F4E3D]">
            BESS Arbitrage Copilot
          </h1>
          <p className="mt-2 text-sm text-[#4A5568]">
            WESM energy arbitrage screening and executive memo generator
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#C9A227] bg-white px-3 py-1.5">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-[#C9A227]" />
          <span className="text-xs font-semibold text-[#1F4E3D]">
            {aiCalls} / {aiLimit} AI calls
          </span>
        </div>
      </div>
    </header>
  );
}