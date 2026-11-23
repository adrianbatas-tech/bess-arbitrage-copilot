// Run with:  node --test tests/bessCalc.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateInputs, dailyArbitrage, npv, irr, projectEconomics,
} from "../src/lib/bessCalc.js";

const good = {
  powerMW: 10, energyMWh: 40, rte: 0.88,
  capexPhpPerKwh: 15000, omPhpPerKwYr: 600, years: 15, discountRate: 0.12,
};

test("validateInputs accepts a sensible project", () => {
  assert.deepEqual(validateInputs(good), []);
});

test("validateInputs rejects bad and missing values", () => {
  const errs = validateInputs({ ...good, rte: 1.4, powerMW: -5, years: undefined });
  assert.ok(errs.some((e) => e.startsWith("rte")));
  assert.ok(errs.some((e) => e.startsWith("powerMW")));
  assert.ok(errs.some((e) => e.startsWith("years")));
});

test("flat prices give zero arbitrage margin", () => {
  const r = dailyArbitrage(Array(24).fill(6000), good);
  assert.equal(r.margin, 0);
});

test("dailyArbitrage picks cheapest and priciest hours correctly", () => {
  // 1 MW / 2 MWh, 100% efficient: charge hours 2,3 at 1,000; discharge 18,19 at 10,000
  const prices = Array(24).fill(5000);
  prices[2] = 1000; prices[3] = 1000; prices[18] = 10000; prices[19] = 10000;
  const r = dailyArbitrage(prices, { powerMW: 1, energyMWh: 2, rte: 1 });
  assert.deepEqual(r.chargeHours, [2, 3]);
  assert.deepEqual(r.dischargeHours, [18, 19]);
  assert.equal(r.margin, 2 * 10000 - 2 * 1000);
});

test("round-trip losses reduce margin", () => {
  const prices = Array(24).fill(5000);
  prices[2] = 1000; prices[18] = 10000;
  const lossless = dailyArbitrage(prices, { powerMW: 1, energyMWh: 1, rte: 1 }).margin;
  const lossy = dailyArbitrage(prices, { powerMW: 1, energyMWh: 1, rte: 0.8 }).margin;
  assert.ok(lossy < lossless);
});

test("npv and irr agree on a textbook case", () => {
  assert.ok(Math.abs(irr([-100, 110]) - 0.10) < 1e-6);
  assert.ok(Math.abs(npv(0.10, [-100, 110])) < 1e-9);
});

test("projectEconomics throws on invalid input", () => {
  assert.throws(() => projectEconomics([], { ...good, rte: 2 }), /rte/);
});
