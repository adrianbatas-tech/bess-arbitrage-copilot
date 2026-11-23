export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatMillions(php, decimals = 1) {
  if (php === null || php === undefined || Number.isNaN(php)) return "n/a";
  return `PHP ${formatNumber(php / 1_000_000, decimals)}M`;
}

export function formatPercent(fraction, decimals = 1) {
  if (fraction === null || fraction === undefined || Number.isNaN(fraction)) return "n/a";
  return `${formatNumber(fraction * 100, decimals)}%`;
}

export function formatRunTime(iso) {
  if (!iso) return "n/a";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "n/a";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}