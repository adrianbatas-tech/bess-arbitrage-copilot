import { PRICE_PROFILE } from "@/lib/priceProfile";

export const SCENARIOS = [
  { id: "base", label: "Base", hint: "1.0x spread" },
  { id: "high", label: "High spread", hint: "1.25x spread" },
  { id: "low", label: "Low spread", hint: "0.75x spread" },
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function scenarioLabel(id) {
  return (SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]).label;
}

/**
 * Builds 365 daily price arrays (PHP/MWh) from the monthly profile.
 * Each day repeats its month's 24-hour shape; high/low scenarios scale the
 * deviation from that day's mean by 1.25 / 0.75.
 */
export function buildDays(scenario = "base") {
  const found = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0];
  const mult = found.id === "high" ? 1.25 : found.id === "low" ? 0.75 : 1;
  const days = [];

  DAYS_IN_MONTH.forEach((dayCount, monthIndex) => {
    const month = PRICE_PROFILE[monthIndex];
    const mean = month.reduce((sum, price) => sum + price, 0) / month.length;
    for (let day = 0; day < dayCount; day++) {
      days.push(mult === 1 ? month.slice() : month.map((p) => mean + (p - mean) * mult));
    }
  });

  return days;
}