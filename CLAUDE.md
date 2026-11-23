# CLAUDE.md — BESS Arbitrage Copilot

## What this app is
A web app that helps a business development manager at a Philippine power generator or
developer screen a battery (BESS) for WESM energy arbitrage and brief management. User enters battery size and cost
assumptions, picks a price scenario, and gets: daily charge/discharge schedule, annual
margin, NPV/IRR/payback, and an AI-written investment memo with risks and what-ifs.

## Stack
- Base44 (TanStack Start + React frontend, Base44 entities as database, Base44 hosting)
- AI: Base44 built-in `InvokeLLM` integration (no API key in code)
- Tests: Node built-in test runner (`node --test tests/bessCalc.test.mjs`)
- CI: GitHub Actions (`.github/workflows/ci.yml`)

## Key files
- `src/lib/priceProfile.js` — synthetic 12x24 price profile (PHP/MWh).
- `src/lib/bessCalc.js` — ALL math lives here. Pure functions, no imports. Never put
  calculation logic inside React components.
- `tests/bessCalc.test.mjs` — unit tests for the math. Add a test for every new function.
- `docs/spec.md`, `docs/architecture.md`, `docs/*.docx` (PRD, validation) — product and design docs.

## Rules
1. Price data is SYNTHETIC (randomized). Never add real company prices, plant names,
   contract terms or model figures to the repo, prompts, or UI.
2. No secrets in code. Keys go in Base44 environment settings / GitHub Secrets only.
3. Validate every user input with `validateInputs()` before calculating or calling the LLM.
4. The LLM explains numbers; it never calculates them. Pass computed results into the
   prompt and tell the model to use only those figures.
5. Units: prices PHP/MWh, power MW, energy MWh, money PHP. Show PHP/kWh in the UI.
6. Keep changes small; one feature per commit with a clear message.

## Platform conventions
Base44 template rules (routing, SDK, entities) are in `AGENTS.md`. Follow them.

## Commands
- Test: `node --test tests/bessCalc.test.mjs`
- Build: `npm run build`
