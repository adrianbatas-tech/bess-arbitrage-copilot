// bessCalc.js — pure calculation engine for the BESS Arbitrage Copilot.
// No React, no Base44 imports: plain functions so they can be unit-tested in CI.
// All prices are PHP/MWh. Power in MW, energy in MWh.

export const LIMITS = {
  powerMW: [1, 500],
  energyMWh: [1, 2000],
  rte: [0.5, 1.0],
  capexPhpPerKwh: [1000, 100000],
  omPhpPerKwYr: [0, 10000],
  years: [1, 30],
  discountRate: [0, 0.5],
};

/** Returns a list of human-readable errors; empty list = valid. */
export function validateInputs(inputs) {
  const errors = [];
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const v = inputs[key];
    if (typeof v !== "number" || Number.isNaN(v)) {
      errors.push(`${key} must be a number`);
    } else if (v < min || v > max) {
      errors.push(`${key} must be between ${min} and ${max}`);
    }
  }
  if (!errors.length && inputs.energyMWh < inputs.powerMW) {
    errors.push("energyMWh must be at least powerMW (minimum 1-hour duration)");
  }
  return errors;
}

/**
 * One-cycle-per-day arbitrage: charge in the cheapest hours, discharge in the
 * most expensive hours. Duration h = energy / power (rounded, min 1).
 * Simplification (see v2 issue): does not enforce charge-before-discharge order.
 */
export function dailyArbitrage(prices24, { powerMW, energyMWh, rte }) {
  if (!Array.isArray(prices24) || prices24.length !== 24) {
    throw new Error("prices24 must be an array of 24 hourly prices");
  }
  const h = Math.max(1, Math.round(energyMWh / powerMW));
  const sorted = prices24.map((p, hour) => ({ p, hour })).sort((a, b) => a.p - b.p);
  const chargeHours = sorted.slice(0, h);
  const dischargeHours = sorted.slice(-h);

  const dischargeMWhPerHour = energyMWh / h;
  const chargeMWhPerHour = dischargeMWhPerHour / rte;

  const revenue = dischargeHours.reduce((s, x) => s + x.p * dischargeMWhPerHour, 0);
  const cost = chargeHours.reduce((s, x) => s + x.p * chargeMWhPerHour, 0);
  const margin = revenue - cost;

  return {
    chargeHours: chargeHours.map((x) => x.hour).sort((a, b) => a - b),
    dischargeHours: dischargeHours.map((x) => x.hour).sort((a, b) => a - b),
    revenue,
    cost,
    // A rational operator skips days where cycling loses money
    margin: Math.max(0, margin),
  };
}

export function npv(rate, cashflows) {
  return cashflows.reduce((s, cf, t) => s + cf / (1 + rate) ** t, 0);
}

/** IRR by bisection between -99% and 200%. Returns null if no sign change. */
export function irr(cashflows) {
  let lo = -0.99, hi = 2.0;
  if (npv(lo, cashflows) * npv(hi, cashflows) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo, cashflows) * npv(mid, cashflows) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/**
 * dailyPrices: array of days, each an array of 24 prices (PHP/MWh).
 * Returns annual margin, cash flows, NPV, IRR and simple payback.
 */
export function projectEconomics(dailyPrices, inputs) {
  const errors = validateInputs(inputs);
  if (errors.length) throw new Error(errors.join("; "));

  const annualMargin = dailyPrices.reduce(
    (s, day) => s + dailyArbitrage(day, inputs).margin, 0);
  const capex = inputs.capexPhpPerKwh * inputs.energyMWh * 1000;
  const fixedOm = inputs.omPhpPerKwYr * inputs.powerMW * 1000;
  const annualCash = annualMargin - fixedOm;

  const cashflows = [-capex, ...Array(inputs.years).fill(annualCash)];
  return {
    annualMargin,
    fixedOm,
    annualCash,
    capex,
    npv: npv(inputs.discountRate, cashflows),
    irr: irr(cashflows),
    paybackYears: annualCash > 0 ? capex / annualCash : null,
  };
}