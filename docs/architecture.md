# Architecture notes

```
Browser (React / TanStack Start, Base44-hosted)
  ├─ InputForm ──► validateInputs()            (src/lib/bessCalc.js)
  ├─ Scenario picker ──► priceProfile.js (synthetic 12x24 prices)
  ├─ Calculate ──► dailyArbitrage() / projectEconomics()   (pure JS, unit-tested)
  ├─ Results cards + dispatch chart
  ├─ Generate memo ──► Base44 InvokeLLM (inputs + results in prompt, JSON schema out)
  └─ Save ──► AnalysisRun entity (inputs, results, memo)

GitHub repo (2-way synced with Base44)
  └─ push to main ──► GitHub Actions: gitleaks secret scan → unit tests → build
```

**Key decisions**
- Math in code, words from AI: avoids LLM arithmetic errors; makes results testable.
- Base44 built-in LLM: no API key to manage, so nothing secret to leak.
- Synthetic price data kept as a code constant: protects real company data; easy to swap later.
- Public app, no auth: grader can open it in incognito; no personal data collected.

**Trade-offs**
- One-cycle/day greedy dispatch ignores charge-before-discharge order (v2 issue).
- Base44 lock-in vs speed of delivery; acceptable for an MVP.
