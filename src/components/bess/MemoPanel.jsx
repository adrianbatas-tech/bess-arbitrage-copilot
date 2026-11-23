import { useState } from "react";
import { Check, Copy, FileText, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function MemoBlock({ title, children }) {
  return (
    <div className="rounded-md border border-slate-200 bg-[#FBFCFB] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{title}</h4>
      <div className="mt-1.5 text-sm leading-relaxed text-[#334155]">{children}</div>
    </div>
  );
}

function memoToText(memo) {
  return [
    "BESS Arbitrage Copilot — Management memo",
    "",
    "Summary",
    memo.summary,
    "",
    "Key drivers",
    ...memo.key_drivers.map((item) => `- ${item}`),
    "",
    "Risks",
    ...memo.risks.map((item) => `- ${item}`),
    "",
    "Recommendation",
    memo.recommendation,
  ].join("\n");
}

export default function MemoPanel({ memo, status, canGenerate, limitReached, onGenerate }) {
  const [copied, setCopied] = useState(false);
  const loading = status === "loading";

  function handleCopy() {
    if (!memo) return;
    navigator.clipboard
      .writeText(memoToText(memo))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setCopied(false));
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[1.125rem] font-semibold text-[#1F4E3D]">
            <FileText aria-hidden="true" className="h-4 w-4 text-[#C9A227]" />
            Management memo
          </h2>
          <p className="mt-0.5 text-xs text-[#4A5568]">
            Analyst-style read of the current run. Figures are passed to the model, never recomputed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {memo ? (
            <button
              type="button"
              onClick={handleCopy}
              className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-[#1F4E3D] transition-colors hover:bg-[#F4F6F5]"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || loading || limitReached}
            className={cn(
              "flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
              !canGenerate || loading || limitReached
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-[#1F4E3D] text-white hover:bg-[#16382c]"
            )}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {loading ? "Drafting memo" : "Generate memo"}
          </button>
        </div>
      </header>

      <div className="mt-3">
        {limitReached && !loading ? (
          <p className="mb-3 rounded-md border border-[#C9A227] bg-[#FBF6E4] px-3 py-2 text-xs font-medium text-[#6B5311]">
            AI limit reached for this session
          </p>
        ) : null}

        {status === "error" ? (
          <p className="rounded-md border border-[#F1C0C0] bg-[#FDF3F3] px-3 py-3 text-sm text-[#B42318]">
            Memo unavailable — try again
          </p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-6 text-sm text-[#4A5568]">
            <Loader2 className="h-4 w-4 animate-spin text-[#1F4E3D]" />
            Drafting the management memo…
          </div>
        ) : null}

        {memo && !loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            <MemoBlock title="Summary">
              <p>{memo.summary}</p>
            </MemoBlock>
            <MemoBlock title="Key drivers">
              <ul className="list-disc space-y-1 pl-4">
                {memo.key_drivers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </MemoBlock>
            <MemoBlock title="Risks">
              <ul className="list-disc space-y-1 pl-4">
                {memo.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </MemoBlock>
            <MemoBlock title="Recommendation">
              <p>{memo.recommendation}</p>
            </MemoBlock>
          </div>
        ) : null}

        {!memo && !loading && status !== "error" ? (
          <p className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-[#4A5568]">
            {canGenerate
              ? "Generate an executive memo from this run."
              : "Run Calculate arbitrage first to draft a memo."}
          </p>
        ) : null}

        <p className="mt-3 text-xs text-[#6B7280]">
          Memo text is model-generated from synthetic prices. Verify before any investment decision.
        </p>
      </div>
    </section>
  );
}