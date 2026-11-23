import { Loader2, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 300;

export default function WhatIfBox({
  question,
  onChange,
  onAsk,
  answer,
  status,
  canAsk,
  limitReached,
}) {
  const loading = status === "loading";
  const trimmed = question.trim();
  const disabled = !canAsk || loading || limitReached || trimmed.length === 0;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-[1.125rem] font-semibold text-[#1F4E3D]">
        <MessageSquare aria-hidden="true" className="h-4 w-4 text-[#C9A227]" />
        Ask a what-if
      </h2>
      <p className="mt-0.5 text-xs text-[#4A5568]">
        Questions about this run only. It will not recalculate — it tells you which input to change.
      </p>

      <div className="mt-3">
        <textarea
          value={question}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_CHARS))}
          maxLength={MAX_CHARS}
          rows={3}
          placeholder="e.g. What happens to payback if capex falls by a fifth?"
          className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-base leading-relaxed text-[#1F4E3D] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#1F4E3D] focus:ring-2 focus:ring-[#1F4E3D]/20"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs tabular-nums text-[#6B7280]">
            {question.length}/{MAX_CHARS}
          </span>
          <button
            type="button"
            onClick={onAsk}
            disabled={disabled}
            className={cn(
              "flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
              disabled
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-[#1F4E3D] text-white hover:bg-[#16382c]"
            )}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {loading ? "Thinking" : "Ask copilot"}
          </button>
        </div>
      </div>

      {limitReached && !loading ? (
        <p className="mt-3 rounded-md border border-[#C9A227] bg-[#FBF6E4] px-3 py-2 text-xs font-medium text-[#6B5311]">
          AI limit reached for this session
        </p>
      ) : null}

      {status === "error" ? (
        <p className="mt-3 rounded-md border border-[#F1C0C0] bg-[#FDF3F3] px-3 py-3 text-sm text-[#B42318]">
          Answer unavailable — try again
        </p>
      ) : null}

      {answer && !loading ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-[#FBFCFB] px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Copilot</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#334155]">
            {answer}
          </p>
        </div>
      ) : null}
    </section>
  );
}