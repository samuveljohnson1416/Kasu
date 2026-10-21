import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBackup, toBackup, toCsv } from "./backup.ts";
import {
  assignMonthToDayOnly,
  budgetPlanned,
  monthStats,
  overallTotals,
  previewMonthAssign,
  splitFood,
} from "./calc.ts";
import { DEFAULT_BUDGETS, type Transaction } from "./model.ts";
import { formatINR } from "./money.ts";

function tx(partial: Partial<Transaction> & Pick<Transaction, "id" | "item" | "amountPaise" | "category" | "date">): Transaction {
  return {
    paymentMethod: null,
    needWant: null,
    refundable: false,
    notes: "",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...partial,
  };
}

const sample: Transaction[] = [
  tx({ id: "1", item: "Tea", amountPaise: 1500, category: "Tea and Coffee", date: { kind: "full", iso: "2026-10-02" } }),
  tx({ id: "2", item: "Rent", amountPaise: 300000, category: "Rent", date: { kind: "full", iso: "2026-10-01" } }),
  tx({
    id: "3",
    item: "Room deposit",
    amountPaise: 500000,
    category: "Advance Deposit",
    date: { kind: "unknown" },
    refundable: true,
  }),
  tx({ id: "4", item: "Puff", amountPaise: 2000, category: "Snacks", date: { kind: "day-only", day: 17 } }),
];

describe("ledger math", () => {
  it("keeps refundable money out of living expenses", () => {
    const totals = overallTotals(sample);
    assert.equal(totals.actualPaise, 303_500);
    assert.equal(totals.refundablePaise, 500_000);
    assert.equal(totals.outflowPaise, 803_500);
    assert.equal(formatINR(totals.actualPaise), "₹3,035.00");
    const october = monthStats(sample, "2026-10");
    assert.equal(october.spendingPaise, 301_500);
    assert.equal(october.refundablePaise, 0);
  });

  it("does not invent a month for day-only rows", () => {
    assert.equal(monthStats(sample, "2026-09").spendingPaise, 0);
    const assigned = assignMonthToDayOnly(sample, "2026-09", "2026-10-03T00:00:00.000Z");
    assert.equal(assigned.updated, 1);
    assert.equal(monthStats(assigned.transactions, "2026-09").spendingPaise, 2_000);
    const preview = previewMonthAssign(sample, "2026-02");
    assert.equal(preview.eligible, 1);
  });

  it("starts with a zero plan and round-trips a backup", () => {
    assert.equal(budgetPlanned(DEFAULT_BUDGETS), 0);
    const food = splitFood(sample);
    assert.equal(food.food, 3_500);
    assert.equal(food.other, 300_000);
    const backup = toBackup({
      transactions: sample,
      budgets: DEFAULT_BUDGETS,
      mealNotes: [],
      dailyLimitPaise: null,
      viewMonth: "2026-10",
      prefs: { recentCategories: [], lastPayment: null },
    });
    const parsed = parseBackup(JSON.parse(JSON.stringify(backup)));
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(overallTotals(parsed.data.transactions).outflowPaise, 803_500);
    assert.match(toCsv(sample), /Room deposit/);
    assert.doesNotMatch(toCsv(sample), /lunch cut/);
  });
});
