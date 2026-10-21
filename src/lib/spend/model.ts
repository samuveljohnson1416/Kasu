import { isRealISODate } from "./dates.ts";

export const CATEGORIES = [
  "Rent",
  "Electricity",
  "Water",
  "Advance Deposit",
  "Mess Food",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Tea and Coffee",
  "Drinks",
  "Groceries",
  "Food",
  "Transport",
  "Mobile Recharge",
  "College Fees",
  "Stationery",
  "Toiletries",
  "Laundry",
  "Household Items",
  "Electronics",
  "Clothing",
  "Footwear",
  "Medical",
  "Entertainment",
  "Shopping",
  "Emergency",
  "Miscellaneous",
] as const;

export type CategoryName = (typeof CATEGORIES)[number];

export const FOOD_CATEGORIES = new Set<string>([
  "Mess Food",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Tea and Coffee",
  "Drinks",
  "Groceries",
  "Food",
]);

export const DAILY_FOOD_CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Tea and Coffee",
  "Drinks",
] as const;

export const SNACKISH_CATEGORIES = new Set<string>(["Snacks", "Tea and Coffee", "Drinks"]);

export const MEAL_CATEGORIES = new Set<string>(["Breakfast", "Lunch", "Dinner"]);

export const FIXED_CATEGORIES = new Set<string>([
  "Rent",
  "Electricity",
  "Water",
  "Mobile Recharge",
  "College Fees",
  "Mess Food",
]);

export const PAYMENT_OPTIONS = [
  { id: "cash", label: "Cash" },
  { id: "upi", label: "UPI" },
  { id: "card", label: "Card" },
  { id: "bank", label: "Bank Transfer" },
  { id: "unspecified", label: "Not Specified" },
] as const;

export type PaymentMethod = (typeof PAYMENT_OPTIONS)[number]["id"];
export type NeedWant = "need" | "want";

export type TxDate =
  | { kind: "full"; iso: string }
  | { kind: "day-only"; day: number }
  | { kind: "unknown" };

export type Transaction = {
  id: string;
  item: string;
  amountPaise: number;
  category: string;
  paymentMethod: PaymentMethod | null;
  needWant: NeedWant | null;
  refundable: boolean;
  notes: string;
  date: TxDate;
  createdAt: string;
  updatedAt: string;
};

export type BudgetLine = {
  id: string;
  label: string;
  categories: string[];
  plannedPaise: number;
  hint?: string;
};

export type MealNote = {
  id: string;
  text: string;
};

export type Prefs = {
  recentCategories: string[];
  lastPayment: PaymentMethod | null;
};

export const DEFAULT_PREFS: Prefs = {
  recentCategories: [],
  lastPayment: null,
};

export const DEFAULT_BUDGETS: BudgetLine[] = [
  { id: "rent", label: "Rent", categories: ["Rent"], plannedPaise: 0 },
  { id: "electricity", label: "Electricity", categories: ["Electricity"], plannedPaise: 0 },
  { id: "water", label: "Water", categories: ["Water"], plannedPaise: 0 },
  {
    id: "mess",
    label: "Mess Food — Lunch and Dinner",
    categories: ["Mess Food", "Lunch", "Dinner"],
    plannedPaise: 0,
    hint: "Covers mess, lunch, and dinner. Put your own monthly amount here.",
  },
  { id: "breakfast", label: "Breakfast", categories: ["Breakfast"], plannedPaise: 0 },
  { id: "snacks", label: "Snacks", categories: ["Snacks"], plannedPaise: 0 },
  { id: "transport", label: "Transport", categories: ["Transport"], plannedPaise: 0 },
  { id: "mobile", label: "Mobile Recharge", categories: ["Mobile Recharge"], plannedPaise: 0 },
  { id: "toiletries", label: "Toiletries", categories: ["Toiletries"], plannedPaise: 0 },
  { id: "laundry", label: "Laundry", categories: ["Laundry"], plannedPaise: 0 },
  { id: "medical", label: "Medical", categories: ["Medical"], plannedPaise: 0 },
  { id: "stationery", label: "Stationery", categories: ["Stationery"], plannedPaise: 0 },
  { id: "misc", label: "Miscellaneous", categories: ["Miscellaneous"], plannedPaise: 0 },
];

export function isKnownCategory(value: string): value is CategoryName {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function paymentLabel(value: PaymentMethod | null): string {
  if (!value) return "Unassigned";
  return PAYMENT_OPTIONS.find((option) => option.id === value)?.label ?? "Unassigned";
}

export function needLabel(value: NeedWant | null): string {
  if (value === "need") return "Need";
  if (value === "want") return "Want";
  return "Unassigned";
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_OPTIONS.some((option) => option.id === value);
}

function isTxDate(value: unknown): value is TxDate {
  if (!value || typeof value !== "object") return false;
  const date = value as TxDate;
  if (date.kind === "unknown") return true;
  if (date.kind === "day-only") {
    return Number.isInteger(date.day) && date.day >= 1 && date.day <= 31;
  }
  if (date.kind === "full") return typeof date.iso === "string" && isRealISODate(date.iso);
  return false;
}

export function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== "object") return false;
  const tx = value as Transaction;
  return (
    typeof tx.id === "string" &&
    tx.id.length > 0 &&
    typeof tx.item === "string" &&
    tx.item.trim().length > 0 &&
    Number.isSafeInteger(tx.amountPaise) &&
    tx.amountPaise > 0 &&
    typeof tx.category === "string" &&
    tx.category.trim().length > 0 &&
    (tx.paymentMethod === null || isPaymentMethod(tx.paymentMethod)) &&
    (tx.needWant === null || tx.needWant === "need" || tx.needWant === "want") &&
    typeof tx.refundable === "boolean" &&
    typeof tx.notes === "string" &&
    isTxDate(tx.date) &&
    typeof tx.createdAt === "string" &&
    typeof tx.updatedAt === "string"
  );
}

export function budgetedCategories(budgets: BudgetLine[]): Set<string> {
  return new Set(budgets.flatMap((line) => line.categories));
}

export function shortBudgetLabel(label: string): string {
  if (label.startsWith("Mess Food")) return "Mess";
  if (label === "Tea and Coffee") return "Tea";
  if (label === "Mobile Recharge") return "Mobile";
  if (label === "Household Items") return "Household";
  if (label === "Advance Deposit") return "Advance";
  if (label === "College Fees") return "College";
  return label;
}
