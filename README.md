# BESS Arbitrage Copilot

AI-assisted screening tool for battery energy storage (BESS) arbitrage in the Philippine
wholesale electricity spot market (WESM).

**Live app:** https://bess-arbitrage-copilot-4d3c23f9.base44.app  
**Demo video (2 min):** LINK  
**Idea validation:** [docs/Validation_Adrian_Atas.docx](docs/Validation_Adrian_Atas.docx)  
**PRD:** [docs/PRD_Adrian_Atas.docx](docs/PRD_Adrian_Atas.docx)  
**Reflection:** [docs/reflection.md](docs/reflection.md)

> ⚠️ All market prices in this app are **synthetic** (randomized for demonstration).
> They are not actual WESM data and do not represent any company's model.

## Problem
The Philippines needs fast capacity relief, and batteries (BESS) are the quickest to deploy.
But screening a BESS for WESM arbitrage takes a business development manager days of
spreadsheet work, and the output is hard for management to judge.

## What it does
1. Enter battery size, efficiency, capex, O&M, life and discount rate
2. Choose a price scenario (Base / High-spread / Low-spread)
3. See the daily charge/discharge schedule and NPV, IRR, payback
4. **AI feature:** generate a one-page investment memo and ask what-if questions, grounded
   only in the calculated results

## Tech stack
Base44 (TanStack Start + React, entities, hosting, built-in LLM) · GitHub Actions · Node test runner

## How it works
See [docs/architecture.md](docs/architecture.md) and [docs/spec.md](docs/spec.md).
All calculations are in `src/lib/bessCalc.js`; the AI only explains them.

## Run tests locally
```bash
node --test tests/bessCalc.test.mjs
```

## Security
- No API keys in the code: the AI uses Base44's built-in integration.
- CI runs a gitleaks secret scan on every push.
- All inputs validated against ranges in `LIMITS`.

## Monitoring
Base44 app analytics (visits) and an `AnalysisRun` log of every calculation and AI memo.

## Roadmap
See open issues — e.g. chronological state-of-charge optimisation.

## Author
Adrian Atas — AIM, Week 4 Graded Assignment 4.2
