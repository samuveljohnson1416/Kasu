import { composeISO, elapsedDays, todayISO } from "./dates.ts";
import {
  budgetedCategories,
  FOOD_CATEGORIES,
  FIXED_CATEGORIES,
  type BudgetLine,
  type Transaction,
} from "./model.ts";

export type CategoryTotal = {
  category: string;
  paise: number;
  count: number;
};

export type OverallTotals = {
  actualPaise: number;
  refundablePaise: number;
  outflowPaise: number;
  count: number;
  largest: Transaction | null;
  topCategory: CategoryTotal | null;
};

export type MonthStats = {
  spendingPaise: number;
  refundablePaise: number;
  todayPaise: number;
  todayDepositPaise: number;
  averageDailyPaise: number;
  count: number;
  largest: Transaction | null;
  topCategory: CategoryTotal | null;
  byCategory: CategoryTotal[];
};

export function isActual(tx: Transaction): boolean {
  return !tx.refundable;
}

export function sumPaise(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amountPaise, 0);
}

export function groupCategories(transactions: Transaction[]): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();
  for (const tx of transactions) {
    const current = map.get(tx.category) ?? { category: tx.category, paise: 0, count: 0 };
    current.paise += tx.amountPaise;
    current.count += 1;
    map.set(tx.category, current);
  }
  return [...map.values()].sort((a, b) => b.paise - a.paise || a.category.localeCompare(b.category));
}

export function pickLargest(transactions: Transaction[]): Transaction | null {
  let best: Transaction | null = null;
  for (const tx of transactions) {
    if (
      !best ||
      tx.amountPaise > best.amountPaise ||
      (tx.amountPaise === best.amountPaise && tx.createdAt > best.createdAt)
    ) {
      best = tx;
    }
  }
  return best;
}

export function overallTotals(transactions: Transaction[]): OverallTotals {
  const actual = transactions.filter(isActual);
  const refundable = transactions.filter((tx) => tx.refundable);
  const categories = groupCategories(actual);
  return {
    actualPaise: sumPaise(actual),
    refundablePaise: sumPaise(refundable),
    outflowPaise: sumPaise(transactions),
    count: transactions.length,
    largest: pickLargest(actual),
    topCategory: categories[0] ?? null,
  };
}

export function inSelectedMonth(tx: Transaction, monthKey: string): boolean {
  return tx.date.kind === "full" && tx.date.iso.slice(0, 7) === monthKey;
}

export function monthStats(transactions: Transaction[], monthKey: string, now = new Date()): MonthStats {
  const inMonth = transactions.filter((tx) => inSelectedMonth(tx, monthKey));
  const spending = inMonth.filter(isActual);
  const deposits = inMonth.filter((tx) => tx.refundable);
  const today = todayISO(now);
  const todayRows = spending.filter((tx) => tx.date.kind === "full" && tx.date.iso === today);
  const todayDeposits = deposits.filter((tx) => tx.date.kind === "full" && tx.date.iso === today);
  const categories = groupCategories(spending);
  const elapsed = elapsedDays(monthKey, now);
  return {
    spendingPaise: sumPaise(spending),
    refundablePaise: sumPaise(deposits),
    todayPaise: sumPaise(todayRows),
    todayDepositPaise: sumPaise(todayDeposits),
    averageDailyPaise: elapsed > 0 ? Math.round(sumPaise(spending) / elapsed) : 0,
    count: inMonth.length,
    largest: pickLargest(spending),
    topCategory: categories[0] ?? null,
    byCategory: categories,
  };
}

export function budgetPlanned(budgets: BudgetLine[]): number {
  return budgets.reduce((sum, line) => sum + line.plannedPaise, 0);
}

export function usedPercent(spentPaise: number, plannedPaise: number): number {
  if (plannedPaise <= 0) return spentPaise > 0 ? 100 : 0;
  return Math.round((spentPaise / plannedPaise) * 100);
}

export function budgetTone(percent: number): "good" | "warn" | "bad" {
  if (percent > 90) return "bad";
  if (percent >= 70) return "warn";
  return "good";
}

export function spentForCategories(
  transactions: Transaction[],
  categories: string[],
  scope: { monthKey: string } | { waiting: true } | { otherThan: string },
): number {
  const wanted = new Set(categories);
  return transactions.reduce((sum, tx) => {
    if (!isActual(tx) || !wanted.has(tx.category)) return sum;
    if ("monthKey" in scope) return inSelectedMonth(tx, scope.monthKey) ? sum + tx.amountPaise : sum;
    if ("waiting" in scope) return tx.date.kind === "full" ? sum : sum + tx.amountPaise;
    return tx.date.kind === "full" && tx.date.iso.slice(0, 7) !== scope.otherThan ? sum + tx.amountPaise : sum;
  }, 0);
}

export type RepeatBuy = {
  item: string;
  count: number;
  paise: number;
};

export function repeatedSmallBuys(transactions: Transaction[], maxEach = 10_000): RepeatBuy[] {
  const groups = new Map<string, { item: string; count: number; paise: number; small: boolean }>();
  for (const tx of transactions) {
    if (!isActual(tx)) continue;
    const key = tx.item.trim().toLowerCase().replace(/\s+/g, " ");
    if (!key) continue;
    const current = groups.get(key) ?? { item: tx.item.trim(), count: 0, paise: 0, small: true };
    current.count += 1;
    current.paise += tx.amountPaise;
    if (tx.amountPaise > maxEach) current.small = false;
    groups.set(key, current);
  }
  return [...groups.values()]
    .filter((group) => group.count >= 2 && group.small)
    .map(({ item, count, paise }) => ({ item, count, paise }))
    .sort((a, b) => b.paise - a.paise || b.count - a.count || a.item.localeCompare(b.item));
}

export function splitFood(transactions: Transaction[]): { food: number; other: number } {
  const actual = transactions.filter(isActual);
  const food = sumPaise(actual.filter((tx) => FOOD_CATEGORIES.has(tx.category)));
  return { food, other: sumPaise(actual) - food };
}

export function splitFixed(transactions: Transaction[]): { fixed: number; variable: number } {
  const actual = transactions.filter(isActual);
  const fixed = sumPaise(actual.filter((tx) => FIXED_CATEGORIES.has(tx.category)));
  return { fixed, variable: sumPaise(actual) - fixed };
}

export function splitNeedWant(transactions: Transaction[]): {
  need: number;
  want: number;
  unlabeled: number;
  labeledCount: number;
} {
  const actual = transactions.filter(isActual);
  return {
    need: sumPaise(actual.filter((tx) => tx.needWant === "need")),
    want: sumPaise(actual.filter((tx) => tx.needWant === "want")),
    unlabeled: sumPaise(actual.filter((tx) => tx.needWant === null)),
    labeledCount: actual.filter((tx) => tx.needWant !== null).length,
  };
}

export function topTransactions(transactions: Transaction[], limit = 10): Transaction[] {
  return transactions
    .filter(isActual)
    .slice()
    .sort((a, b) => b.amountPaise - a.amountPaise || b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function monthlySeries(transactions: Transaction[]): { monthKey: string; paise: number }[] {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (!isActual(tx) || tx.date.kind !== "full") continue;
    const key = tx.date.iso.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + tx.amountPaise);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([monthKey, paise]) => ({ monthKey, paise }));
}

export function dailySeries(transactions: Transaction[], monthKey: string): { day: string; paise: number }[] {
  const [year, month] = monthKey.split("-").map(Number);
  const days = new Date(year, month, 0).getDate();
  const totals = Array.from({ length: days }, () => 0);
  for (const tx of transactions) {
    if (!isActual(tx) || tx.date.kind !== "full" || tx.date.iso.slice(0, 7) !== monthKey) continue;
    const day = Number(tx.date.iso.slice(8, 10));
    totals[day - 1] += tx.amountPaise;
  }
  return totals.map((paise, index) => ({ day: String(index + 1), paise }));
}

export function countingNote(tx: Transaction): string {
  if (tx.refundable) {
    return "Refundable deposit. It counts in cash outflow and deposits, not in living expenses or monthly spending.";
  }
  if (tx.date.kind !== "full") {
    return "Counted in overall expenses. It stays out of monthly totals and date charts until the date is complete.";
  }
  return "Counted in living expenses for the month of this date.";
}

export function describeDate(tx: Transaction): string {
  if (tx.date.kind === "full") {
    const [year, month, day] = tx.date.iso.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (tx.date.kind === "day-only") return `${ordinalDay(tx.date.day)} · month not set`;
  return "Date not set";
}

function ordinalDay(day: number): string {
  const mod100 = day % 100;
  const mod10 = day % 10;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : mod10 === 1 ? "st" : mod10 === 2 ? "nd" : mod10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
}

export function needsFullDate(tx: Transaction): boolean {
  return tx.date.kind !== "full";
}

export function previewMonthAssign(
  transactions: Transaction[],
  monthKey: string,
): { eligible: number; skipped: number } {
  let eligible = 0;
  let skipped = 0;
  for (const tx of transactions) {
    if (tx.date.kind !== "day-only") continue;
    if (composeISO(monthKey, tx.date.day)) eligible += 1;
    else skipped += 1;
  }
  return { eligible, skipped };
}

export function assignMonthToDayOnly(
  transactions: Transaction[],
  monthKey: string,
  nowIso: string,
): { transactions: Transaction[]; updated: number; skipped: number } {
  let updated = 0;
  let skipped = 0;
  const next = transactions.map((tx) => {
    if (tx.date.kind !== "day-only") return tx;
    const iso = composeISO(monthKey, tx.date.day);
    if (!iso) {
      skipped += 1;
      return tx;
    }
    updated += 1;
    return { ...tx, date: { kind: "full" as const, iso }, updatedAt: nowIso };
  });
  return { transactions: next, updated, skipped };
}

export function sortTransactions(
  transactions: Transaction[],
  sort: "newest" | "oldest" | "highest" | "lowest",
): Transaction[] {
  const copy = transactions.slice();
  const time = (tx: Transaction) => {
    if (tx.date.kind === "full") {
      const [year, month, day] = tx.date.iso.split("-").map(Number);
      return new Date(year, month - 1, day, 12).getTime();
    }
    return Date.parse(tx.createdAt);
  };
  copy.sort((a, b) => {
    if (sort === "highest") return b.amountPaise - a.amountPaise || time(b) - time(a);
    if (sort === "lowest") return a.amountPaise - b.amountPaise || time(b) - time(a);
    const delta = time(b) - time(a);
    return sort === "newest" ? delta : -delta;
  });
  return copy;
}

export function unbudgetedCategories(transactions: Transaction[], budgets: BudgetLine[]): string[] {
  const planned = budgetedCategories(budgets);
  const found = new Set<string>();
  for (const tx of transactions) {
    if (!isActual(tx) || planned.has(tx.category)) continue;
    found.add(tx.category);
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

export function previousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
