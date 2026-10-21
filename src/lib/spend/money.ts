const MAX_PAISE = 100_000_000_00;

export function formatINR(paise: number): string {
  const rounded = Math.round(paise);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const rupees = Math.floor(abs / 100);
  const frac = abs % 100;
  const grouped = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rupees);
  return `${sign}₹${grouped}.${String(frac).padStart(2, "0")}`;
}

export function formatAxis(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rupees)}`;
}

export function paiseToInput(paise: number): string {
  const abs = Math.abs(Math.round(paise));
  const rupees = Math.floor(abs / 100);
  const frac = abs % 100;
  if (frac === 0) return String(rupees);
  return `${rupees}.${String(frac).padStart(2, "0")}`;
}

export function parseRupeesToPaise(raw: string, allowZero = false): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(paise) || paise > MAX_PAISE) return null;
  if (paise < 0) return null;
  if (paise === 0 && !allowZero) return null;
  return paise;
}

export function formatPercent(percent: number): string {
  if (!Number.isFinite(percent)) return "0%";
  return `${Math.max(0, Math.round(percent))}%`;
}
