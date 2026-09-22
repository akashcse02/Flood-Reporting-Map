export function formatBDT(value: number): string {
  if (value >= 10000000) return `৳ ${(value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 2)} Cr`;
  if (value >= 100000) return `৳ ${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 2)} Lakh`;
  return `৳ ${value.toLocaleString("en-US")}`;
}

export function formatSize(size: number, unit: string): string {
  return `${size.toLocaleString("en-US")} ${unit}`;
}

export function timeAgo(iso: string): string {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.round(days / 30)} mo ago`;
}
