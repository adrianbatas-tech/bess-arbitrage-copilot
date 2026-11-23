import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { dailyArbitrage, projectEconomics, validateInputs } from "@/lib/bessCalc";
import { buildDays } from "@/lib/scenario";
import { DEFAULT_FORM, fromInputs, mapFieldErrors, toInputs } from "@/lib/formState";
import { getAiCalls, getSessionId, saveAiCalls } from "@/lib/session";
import { askWhatIf, generateMemo } from "@/lib/server-fns";
import SyntheticBanner from "@/components/bess/SyntheticBanner";
import SiteHeader from "@/components/bess/SiteHeader";
import ScenarioSelector from "@/components/bess/ScenarioSelector";
import InputsForm from "@/components/bess/InputsForm";
import ResultsGrid from "@/components/bess/ResultsGrid";
import DispatchChart from "@/components/bess/DispatchChart";
import MemoPanel from "@/components/bess/MemoPanel";
import WhatIfBox from "@/components/bess/WhatIfBox";
import RunHistory from "@/components/bess/RunHistory";

const AI_LIMIT = 10;

export const Route = createFileRoute("/")({
  component: CopilotPage,
  head: () => ({
    meta: [
      { title: "BESS Arbitrage Copilot — WESM arbitrage screening" },
      {
        name: "description",
        content:
          "Screen battery energy storage arbitrage economics against a synthetic WESM price profile and draft a management memo.",
      },
    ],
  }),
});

function CopilotPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [scenario, setScenario] = useState("base");
  const [results, setResults] = useState(null);
  const [resultInputs, setResultInputs] = useState(null);
  const [resultScenario, setResultScenario] = useState("base");

  const [sessionId, setSessionId] = useState(null);
  const [aiCalls, setAiCalls] = useState(0);
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [currentRunId, setCurrentRunId] = useState(null);

  const [memo, setMemo] = useState(null);
  const [memoStatus, setMemoStatus] = useState("idle");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [askStatus, setAskStatus] = useState("idle");

  const generateMemoFn = useServerFn(generateMemo);
  const askWhatIfFn = useServerFn(askWhatIf);

  const inputs = useMemo(() => toInputs(form), [form]);
  const errors = validateInputs(inputs);
  const fieldErrors = mapFieldErrors(errors);
  const isValid = errors.length === 0;
  const limitReached = aiCalls >= AI_LIMIT;

  useEffect(() => {
    setSessionId(getSessionId());
    setAiCalls(getAiCalls());
  }, []);

  useEffect(() => {
    if (!sessionId) return undefined;
    let cancelled = false;
    setRunsLoading(true);
    base44.entities.AnalysisRun.filter(
      { session_id: sessionId },
      { sort: "-created_date", limit: 10 }
    )
      .then((page) => {
        if (!cancelled) setRuns(page.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setRuns([]);
      })
      .finally(() => {
        if (!cancelled) setRunsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function loadRuns() {
    if (!sessionId) return;
    try {
      const page = await base44.entities.AnalysisRun.filter(
        { session_id: sessionId },
        { sort: "-created_date", limit: 10 }
      );
      setRuns(page.items ?? []);
    } catch {
      // history is a convenience; the numbers above stay usable without it
    }
  }

  function handleFieldChange(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function registerAiCall() {
    const next = aiCalls + 1;
    setAiCalls(next);
    saveAiCalls(next);
    return next;
  }

  async function handleCalculate() {
    if (!isValid) return;
    const next = projectEconomics(buildDays(scenario), inputs);
    setResults(next);
    setResultInputs(inputs);
    setResultScenario(scenario);
    setMemo(null);
    setMemoStatus("idle");
    setAnswer(null);
    setAskStatus("idle");
    setCurrentRunId(null);

    if (!sessionId) return;
    try {
      const record = await base44.entities.AnalysisRun.create({
        session_id: sessionId,
        scenario,
        inputs,
        results: next,
        memo: {},
        ai_calls: aiCalls,
        ai_latency_ms: 0,
        ai_status: "none",
      });
      setCurrentRunId(record.id);
      await loadRuns();
    } catch {
      toast.error("Run not saved to history.");
    }
  }

  function figuresForRequest() {
    return JSON.stringify({ inputs: resultInputs, scenario: resultScenario, results });
  }

  async function handleGenerateMemo() {
    if (!results || !resultInputs) return;
    if (limitReached) {
      toast.error("AI limit reached for this session");
      return;
    }
    const calls = registerAiCall();
    const started = Date.now();
    setMemoStatus("loading");

    try {
      const nextMemo = await generateMemoFn({ data: { figures: figuresForRequest() } });
      const latency = Date.now() - started;
      setMemo(nextMemo);
      setMemoStatus("ok");
      if (currentRunId) {
        await base44.entities.AnalysisRun.update(currentRunId, {
          memo: nextMemo,
          ai_status: "ok",
          ai_latency_ms: latency,
          ai_calls: calls,
        });
        await loadRuns();
      }
    } catch {
      setMemoStatus("error");
      if (currentRunId) {
        try {
          await base44.entities.AnalysisRun.update(currentRunId, {
            ai_status: "error",
            ai_latency_ms: Date.now() - started,
            ai_calls: calls,
          });
          await loadRuns();
        } catch {
          // keep the run visible even if the status write fails
        }
      }
    }
  }

  async function handleAsk() {
    const cleaned = question
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 300);
    if (!cleaned || !results || !resultInputs) return;
    if (limitReached) {
      toast.error("AI limit reached for this session");
      return;
    }
    const calls = registerAiCall();
    setAskStatus("loading");
    setAnswer(null);

    try {
      const response = await askWhatIfFn({
        data: { figures: figuresForRequest(), question: cleaned },
      });
      setAnswer(response.answer);
      setAskStatus("ok");
    } catch {
      setAskStatus("error");
    }

    if (currentRunId) {
      base44.entities.AnalysisRun.update(currentRunId, { ai_calls: calls }).catch(() => {});
    }
  }

  function handleSelectRun(run) {
    if (!run.inputs || !run.results) return;
    setForm(fromInputs(run.inputs));
    setScenario(run.scenario);
    setResults(run.results);
    setResultInputs(run.inputs);
    setResultScenario(run.scenario);
    setCurrentRunId(run.id);
    const hasMemo = Boolean(run.memo && run.memo.summary);
    setMemo(hasMemo ? run.memo : null);
    setMemoStatus(hasMemo ? "ok" : "idle");
    setAnswer(null);
    setAskStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const dispatch = useMemo(() => {
    if (!results || !resultInputs) return null;
    const days = buildDays(resultScenario);
    const avgPrices = Array.from(
      { length: 24 },
      (_, hour) => days.reduce((sum, day) => sum + day[hour], 0) / days.length
    );
    const day = dailyArbitrage(avgPrices, resultInputs);
    return { avgPrices, chargeHours: day.chargeHours, dischargeHours: day.dischargeHours };
  }, [results, resultInputs, resultScenario]);

  return (
    <div className="min-h-screen bg-[#F4F6F5] font-body text-[#4A5568]">
      <SyntheticBanner />
      <SiteHeader aiCalls={aiCalls} aiLimit={AI_LIMIT} />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-4 lg:sticky lg:top-[52px]">
            <ScenarioSelector value={scenario} onChange={setScenario} />
            <InputsForm
              form={form}
              fieldErrors={fieldErrors}
              isValid={isValid}
              onChange={handleFieldChange}
              onCalculate={handleCalculate}
            />
          </div>

          <div className="min-w-0 space-y-6">
            <ResultsGrid results={results} inputs={resultInputs} scenario={resultScenario} />
            {dispatch ? (
              <DispatchChart
                avgPrices={dispatch.avgPrices}
                chargeHours={dispatch.chargeHours}
                dischargeHours={dispatch.dischargeHours}
              />
            ) : null}
            <MemoPanel
              memo={memo}
              status={memoStatus}
              canGenerate={Boolean(results)}
              limitReached={limitReached}
              onGenerate={handleGenerateMemo}
            />
            <WhatIfBox
              question={question}
              onChange={setQuestion}
              onAsk={handleAsk}
              answer={answer}
              status={askStatus}
              canAsk={Boolean(results)}
              limitReached={limitReached}
            />
            <RunHistory
              runs={runs}
              loading={runsLoading}
              activeId={currentRunId}
              onSelect={handleSelectRun}
            />
          </div>
        </div>
      </main>

      <footer className="mt-4 border-t border-slate-200 py-6">
        <p className="text-center text-xs text-[#6B7280]">
          BESS Arbitrage Copilot · AIM Assignment 4.2 · Synthetic data
        </p>
      </footer>
    </div>
  );
}