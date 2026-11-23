export const DEFAULT_FORM = {
  powerMW: "10",
  energyMWh: "40",
  rte: "0.88",
  capexPhpPerKwh: "15000",
  omPhpPerKwYr: "600",
  years: "15",
  discountRatePct: "12",
};

export const INPUT_FIELDS = [
  { key: "powerMW", label: "Power", unit: "MW", step: "1" },
  { key: "energyMWh", label: "Energy", unit: "MWh", step: "1" },
  { key: "rte", label: "Round-trip eff.", unit: "0-1", step: "0.01" },
  { key: "capexPhpPerKwh", label: "Capex", unit: "PHP/kWh", step: "100" },
  { key: "omPhpPerKwYr", label: "Fixed O&M", unit: "PHP/kW-yr", step: "10" },
  { key: "years", label: "Lifetime", unit: "years", step: "1" },
  { key: "discountRatePct", label: "Discount rate", unit: "%", step: "0.5" },
];

/** Form strings (discount rate as a percent) -> engine inputs (rate as a fraction). */
export function toInputs(form) {
  return {
    powerMW: Number(form.powerMW),
    energyMWh: Number(form.energyMWh),
    rte: Number(form.rte),
    capexPhpPerKwh: Number(form.capexPhpPerKwh),
    omPhpPerKwYr: Number(form.omPhpPerKwYr),
    years: Number(form.years),
    discountRate: Number(form.discountRatePct) / 100,
  };
}

/** Engine inputs (saved on a run) -> editable form strings. */
export function fromInputs(inputs) {
  return {
    powerMW: String(inputs.powerMW),
    energyMWh: String(inputs.energyMWh),
    rte: String(inputs.rte),
    capexPhpPerKwh: String(inputs.capexPhpPerKwh),
    omPhpPerKwYr: String(inputs.omPhpPerKwYr),
    years: String(inputs.years),
    discountRatePct: String(Number((inputs.discountRate * 100).toFixed(4))),
  };
}

/** Maps validateInputs() messages onto the form field they belong to. */
export function mapFieldErrors(errors) {
  const byField = {};
  for (const message of errors) {
    const key = message.split(" ")[0];
    const field = key === "discountRate" ? "discountRatePct" : key;
    if (!byField[field]) byField[field] = message;
  }
  return byField;
}