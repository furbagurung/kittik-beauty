export function formatCurrency(value: number) {
  return `NPR ${value.toLocaleString()}`;
}

export function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) return `NPR ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `NPR ${(value / 1_000).toFixed(1)}K`;
  return `NPR ${value.toLocaleString()}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString();
}

export function formatRelativeTime(isoOrDate: string | Date) {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatShortDate(isoOrDate: string | Date) {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatClockTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
