# spec.md — BESS Arbitrage Copilot (v1.1)

## 1. Goal
Let a business development manager screen a BESS arbitrage case in under 5 minutes and
get a management-ready memo, instead of building a spreadsheet model from scratch.

## 2. User and job-to-be-done
Primary: business development manager at a Philippine generator or developer.
Decision maker: finance manager, executives or management committee who approve
feasibility studies. "Before I ask for budget to study a battery, I need a quick,
defensible view of whether WESM spreads can pay for it."

## 3. Features (v1)
| # | Feature | Acceptance criteria |
|---|---------|---------------------|
| F1 | Input form | Power (MW), energy (MWh), round-trip efficiency, capex (PHP/kWh), fixed O&M (PHP/kW-yr), life (yrs), discount rate. Invalid values show inline errors; Calculate is disabled until valid. |
| F2 | Price scenario | Choose Base / High-spread / Low-spread. Base = synthetic 12-month x 24-hour profile. High/Low: for each day, price = dayMean + (price - dayMean) x 1.25 or x 0.75. Labelled "Synthetic data". Expected IRR at defaults: Base ~17%, High ~24%, Low ~10%. |
| F3 | Dispatch view | Chart of an average day's 24 prices with charge hours (green) and discharge hours (amber). |
| F4 | Economics | Cards for annual margin, capex, NPV, IRR, payback. Values match `projectEconomics()`. |
| F5 | AI memo (core AI) | Button "Generate memo". Sends inputs + computed results to InvokeLLM; returns JSON {summary, key_drivers[], risks[], recommendation}. Rendered as a 1-page memo. Must cite only supplied numbers. |
| F6 | Ask a what-if | Text box (max 300 chars, live counter, HTML stripped, empty blocked). Question passed to the LLM as quoted data with instructions to ignore embedded instructions and refuse unrelated questions. |
| F6b | AI usage cap | Max 10 AI calls (memo + what-if) per browser session; friendly message when reached. |
| F7 | Saved runs | Each run saved to `AnalysisRun` with a random per-browser session_id. History shows the last 10 runs for the current session only; clicking a row reloads it. |

## 4. Data model (Base44 entities)
- Price data: `src/lib/priceProfile.js` constant (12 x 24, PHP/MWh, synthetic). Scenarios derived in code, not stored.
- `AnalysisRun`: session_id, scenario, inputs, results, memo, ai_calls, ai_latency_ms, ai_status (ok/error/none), created_date (auto)

## 5. AI design
- Model: Base44 InvokeLLM (default model), `response_json_schema` enforced.
- System guardrails in prompt: use only provided figures; state that prices are synthetic;
  flag merchant-price risk, degradation, regulatory/grid-connection risk; ≤250 words.
- Failure handling: on error or malformed JSON, show "Memo unavailable — try again" and keep numbers visible.

## 6. Non-functional
- Public app (no login) so it opens in incognito.
- No secrets in repo; gitleaks runs in CI.
- Input length limits on free text; numeric ranges per `LIMITS` in bessCalc.js.
- Monitoring: Base44 app analytics + each run logs AI call count, latency and status in `AnalysisRun`.

## 7. Out of scope (v1)
Regulating Reserve revenue, degradation curves, chronological state-of-charge optimisation,
real WESM data feeds, user accounts.

## 8. Changelog (revisions after review)
- v1.0 → v1.1 (after senior-engineer review, 23 Nov 2026):
  1. Run history scoped to a per-browser session_id. Reason: public app with no login would otherwise show every visitor's runs.
  2. What-if input hardened against prompt injection: text stripped, passed as quoted data, model told to ignore embedded instructions.
  3. AI calls capped at 10 per session. Reason: protect platform credits on a public link.
  4. High/Low scenario defined exactly (deviation from daily mean x 1.25 / 0.75) so results are reproducible and testable.
  5. Removed unused `PriceProfile` entity; price profile kept as a code constant. Added AI latency/status logging for monitoring.
