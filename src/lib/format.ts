export function formatBDT(value: number): string {
  if (value >= 10000000) return `৳ ${(value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 2)} Cr`;
  if (value >= 100000) return `৳ ${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 2)} Lakh`;
  return `৳ ${value.toLocaleString("en-US")}`;
}

export function formatSize(size: number, unit: string): string {
  return `${size.toLocaleString("en-US")} ${unit}`;
}

const bnNum = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)] ?? d);

export function timeAgo(iso: string, lang: "bn" | "en" = "en"): string {
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
  const bn = lang === "bn";
  if (days === 0) return bn ? "আজ" : "Today";
  if (days === 1) return bn ? "গতকাল" : "Yesterday";
  if (days < 30) return bn ? `${bnNum(days)} দিন আগে` : `${days} days ago`;
  const m = Math.round(days / 30);
  return bn ? `${bnNum(m)} মাস আগে` : `${m} mo ago`;
}
