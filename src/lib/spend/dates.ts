export function currentMonthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function todayISO(now = new Date()): string {
  return `${currentMonthKey(now)}-${String(now.getDate()).padStart(2, "0")}`;
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return currentMonthKey(date);
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function shortMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function elapsedDays(monthKey: string, now = new Date()): number {
  const current = currentMonthKey(now);
  if (monthKey < current) return daysInMonth(monthKey);
  if (monthKey > current) return 0;
  return now.getDate();
}

export function daysLeftInMonth(monthKey: string, now = new Date()): number {
  const current = currentMonthKey(now);
  if (monthKey < current) return 0;
  if (monthKey > current) return daysInMonth(monthKey);
  return daysInMonth(monthKey) - now.getDate() + 1;
}

export function isRealISODate(iso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function composeISO(monthKey: string, day: number): string | null {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return null;
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;
  const iso = `${monthKey}-${String(day).padStart(2, "0")}`;
  return isRealISODate(iso) ? iso : null;
}

export function ordinal(day: number): string {
  const mod100 = day % 100;
  const mod10 = day % 10;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : mod10 === 1 ? "st" : mod10 === 2 ? "nd" : mod10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
}

export function formatFullDate(iso: string): string {
  if (!isRealISODate(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
