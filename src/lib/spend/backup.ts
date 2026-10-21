import { isRealISODate } from "./dates.ts";
import { formatINR, paiseToInput } from "./money.ts";
import {
  DEFAULT_BUDGETS,
  DEFAULT_PREFS,
  isPaymentMethod,
  isTransaction,
  paymentLabel,
  type BudgetLine,
  type MealNote,
  type PaymentMethod,
  type Prefs,
  type Transaction,
} from "./model.ts";

export type BackupData = {
  version: 1;
  app: "Kasu";
  exportedAt: string;
  transactions: Transaction[];
  budgets: BudgetLine[];
  mealNotes: MealNote[];
  dailyLimitPaise: number | null;
  viewMonth: string;
  prefs: Prefs;
};

function csvCell(value: string): string {
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(guarded)) return `"${guarded.replace(/"/g, '""')}"`;
  return guarded;
}

function dateColumns(tx: Transaction): [string, string, string] {
  if (tx.date.kind === "full") return ["full", tx.date.iso, ""];
  if (tx.date.kind === "day-only") return ["day-only", "", String(tx.date.day)];
  return ["unknown", "", ""];
}

export function toCsv(transactions: Transaction[]): string {
  const header = [
    "Id",
    "Date status",
    "Date",
    "Day",
    "Item",
    "Amount INR",
    "Category",
    "Payment method",
    "Need or want",
    "Refundable",
    "Notes",
  ];
  const lines = transactions.map((tx) => {
    const [status, date, day] = dateColumns(tx);
    return [
      tx.id,
      status,
      date,
      day,
      tx.item,
      paiseToInput(tx.amountPaise),
      tx.category,
      tx.paymentMethod ? paymentLabel(tx.paymentMethod) : "",
      tx.needWant ?? "",
      tx.refundable ? "Yes" : "No",
      tx.notes,
    ]
      .map(csvCell)
      .join(",");
  });
  return `\uFEFF${[header.join(","), ...lines].join("\n")}\n`;
}

export function toBackup(input: Omit<BackupData, "version" | "app" | "exportedAt">): BackupData {
  return {
    version: 1,
    app: "Kasu",
    exportedAt: new Date().toISOString(),
    ...input,
  };
}

function isMealNote(value: unknown): value is MealNote {
  if (!value || typeof value !== "object") return false;
  const note = value as MealNote;
  return typeof note.id === "string" && note.id.length > 0 && typeof note.text === "string" && note.text.trim().length > 0;
}

function mergeBudgets(value: unknown): BudgetLine[] | null {
  if (!Array.isArray(value)) return null;
  const saved = new Map<string, number>();
  for (const line of value) {
    if (!line || typeof line !== "object") return null;
    const id = (line as BudgetLine).id;
    const planned = (line as BudgetLine).plannedPaise;
    if (typeof id !== "string" || !Number.isSafeInteger(planned) || planned < 0) return null;
    saved.set(id, planned);
  }
  return DEFAULT_BUDGETS.map((line) =>
    saved.has(line.id) ? { ...line, plannedPaise: saved.get(line.id) ?? line.plannedPaise } : line,
  );
}

function readPrefs(value: unknown): Prefs {
  if (!value || typeof value !== "object") return DEFAULT_PREFS;
  const prefs = value as Prefs;
  const recent = Array.isArray(prefs.recentCategories)
    ? prefs.recentCategories.filter((item): item is string => typeof item === "string").slice(0, 8)
    : [];
  const lastPayment: PaymentMethod | null = isPaymentMethod(prefs.lastPayment) ? prefs.lastPayment : null;
  return { recentCategories: recent, lastPayment };
}

export function parseBackup(value: unknown): { ok: true; data: BackupData } | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "That file is not a Kasu backup." };
  const raw = value as Partial<BackupData>;
  if (raw.version !== 1) return { ok: false, error: "This backup version is not supported." };
  if (!Array.isArray(raw.transactions) || !raw.transactions.every(isTransaction)) {
    return { ok: false, error: "The transaction list in that file is incomplete or invalid." };
  }
  const budgets = mergeBudgets(raw.budgets);
  if (!budgets) return { ok: false, error: "The budget section in that file is invalid." };
  if (!Array.isArray(raw.mealNotes) || !raw.mealNotes.every(isMealNote)) {
    return { ok: false, error: "The meal notes in that file are invalid." };
  }
  let dailyLimitPaise: number | null = null;
  if (raw.dailyLimitPaise !== null && raw.dailyLimitPaise !== undefined) {
    if (!Number.isSafeInteger(raw.dailyLimitPaise) || raw.dailyLimitPaise < 0) {
      return { ok: false, error: "The daily limit in that file is invalid." };
    }
    dailyLimitPaise = raw.dailyLimitPaise === 0 ? null : raw.dailyLimitPaise;
  }
  const viewMonth =
    typeof raw.viewMonth === "string" && /^\d{4}-\d{2}$/.test(raw.viewMonth) && isRealISODate(`${raw.viewMonth}-01`)
      ? raw.viewMonth
      : "";
  return {
    ok: true,
    data: {
      version: 1,
      app: "Kasu",
      exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
      transactions: raw.transactions,
      budgets,
      mealNotes: raw.mealNotes.map((note) => ({ id: note.id, text: note.text.trim() })),
      dailyLimitPaise,
      viewMonth,
      prefs: readPrefs(raw.prefs),
    },
  };
}

export function downloadText(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function formatExportStamp(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function outflowLabel(transactions: Transaction[]): string {
  const outflow = transactions.reduce((sum, tx) => sum + tx.amountPaise, 0);
  return formatINR(outflow);
}
