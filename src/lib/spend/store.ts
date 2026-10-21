import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { assignMonthToDayOnly } from "./calc.ts";
import { currentMonthKey } from "./dates.ts";
import {
  DEFAULT_BUDGETS,
  DEFAULT_PREFS,
  isPaymentMethod,
  isTransaction,
  type BudgetLine,
  type MealNote,
  type PaymentMethod,
  type Prefs,
  type Transaction,
  type TxDate,
} from "./model.ts";

export type Draft = {
  item: string;
  amountPaise: number;
  category: string;
  paymentMethod: PaymentMethod | null;
  needWant: "need" | "want" | null;
  refundable: boolean;
  notes: string;
  date: TxDate;
};

type Persisted = {
  transactions: Transaction[];
  budgets: BudgetLine[];
  mealNotes: MealNote[];
  dailyLimitPaise: number | null;
  viewMonth: string;
  prefs: Prefs;
};

type SpendState = Persisted & {
  addTransaction: (draft: Draft) => string;
  updateTransaction: (id: string, draft: Draft) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (id: string, plannedPaise: number) => void;
  setDailyLimit: (paise: number | null) => void;
  setViewMonth: (monthKey: string) => void;
  deleteMealNote: (id: string) => void;
  assignDayOnlyMonth: (monthKey: string) => { updated: number; skipped: number };
  replaceAll: (data: Persisted) => void;
};

const memory = new Map<string, string>();

const safeLocalStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

function assertDraft(draft: Draft) {
  if (!draft.item.trim()) throw new Error("Item name is required.");
  if (!Number.isSafeInteger(draft.amountPaise) || draft.amountPaise <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
  if (!draft.category.trim()) throw new Error("Category is required.");
  if (draft.date.kind === "full" && !/^\d{4}-\d{2}-\d{2}$/.test(draft.date.iso)) {
    throw new Error("Date is invalid.");
  }
  if (draft.date.kind === "day-only" && (draft.date.day < 1 || draft.date.day > 31)) {
    throw new Error("Day is invalid.");
  }
}

function remember(prefs: Prefs, category: string, payment: PaymentMethod | null): Prefs {
  const recent = [category, ...prefs.recentCategories.filter((item) => item !== category)].slice(0, 6);
  return {
    recentCategories: recent,
    lastPayment: payment,
  };
}

function mergeBudgets(saved: BudgetLine[] | undefined): BudgetLine[] {
  const amounts = new Map((saved ?? []).map((line) => [line.id, line.plannedPaise]));
  return DEFAULT_BUDGETS.map((line) => {
    const planned = amounts.get(line.id);
    if (!Number.isSafeInteger(planned) || planned === undefined || planned < 0) return line;
    return { ...line, plannedPaise: planned };
  });
}

function readPersisted(value: unknown): Partial<Persisted> {
  if (!value || typeof value !== "object") return {};
  const raw = value as Partial<Persisted>;
  const transactions = Array.isArray(raw.transactions) ? raw.transactions.filter(isTransaction) : undefined;
  const mealNotes = Array.isArray(raw.mealNotes)
    ? raw.mealNotes.filter(
        (note): note is MealNote =>
          !!note &&
          typeof note === "object" &&
          typeof note.id === "string" &&
          typeof note.text === "string" &&
          note.text.trim().length > 0,
      )
    : undefined;
  return {
    transactions,
    budgets: Array.isArray(raw.budgets) ? raw.budgets : undefined,
    mealNotes,
    dailyLimitPaise:
      raw.dailyLimitPaise === null || (Number.isSafeInteger(raw.dailyLimitPaise) && (raw.dailyLimitPaise ?? 0) > 0)
        ? (raw.dailyLimitPaise ?? null)
        : null,
    viewMonth: typeof raw.viewMonth === "string" && /^\d{4}-\d{2}$/.test(raw.viewMonth) ? raw.viewMonth : undefined,
    prefs: raw.prefs
      ? {
          recentCategories: Array.isArray(raw.prefs.recentCategories)
            ? raw.prefs.recentCategories.filter((item): item is string => typeof item === "string").slice(0, 8)
            : [],
          lastPayment: isPaymentMethod(raw.prefs.lastPayment) ? raw.prefs.lastPayment : null,
        }
      : undefined,
  };
}

export const useSpend = create<SpendState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: DEFAULT_BUDGETS.map((line) => ({ ...line, plannedPaise: 0 })),
      mealNotes: [],
      dailyLimitPaise: null,
      viewMonth: currentMonthKey(),
      prefs: DEFAULT_PREFS,
      addTransaction: (draft) => {
        assertDraft(draft);
        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        const tx: Transaction = {
          id,
          item: draft.item.trim(),
          amountPaise: draft.amountPaise,
          category: draft.category.trim(),
          paymentMethod: draft.paymentMethod,
          needWant: draft.needWant,
          refundable: draft.refundable,
          notes: draft.notes.trim(),
          date: draft.date,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [tx, ...state.transactions],
          prefs: remember(state.prefs, tx.category, tx.paymentMethod),
        }));
        return id;
      },
      updateTransaction: (id, draft) => {
        assertDraft(draft);
        const now = new Date().toISOString();
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id
              ? {
                  ...tx,
                  item: draft.item.trim(),
                  amountPaise: draft.amountPaise,
                  category: draft.category.trim(),
                  paymentMethod: draft.paymentMethod,
                  needWant: draft.needWant,
                  refundable: draft.refundable,
                  notes: draft.notes.trim(),
                  date: draft.date,
                  updatedAt: now,
                }
              : tx,
          ),
          prefs: remember(state.prefs, draft.category.trim(), draft.paymentMethod),
        }));
      },
      deleteTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) }));
      },
      setBudget: (id, plannedPaise) => {
        if (!Number.isSafeInteger(plannedPaise) || plannedPaise < 0) return;
        set((state) => ({
          budgets: state.budgets.map((line) => (line.id === id ? { ...line, plannedPaise } : line)),
        }));
      },
      setDailyLimit: (paise) => {
        set({ dailyLimitPaise: paise && paise > 0 ? paise : null });
      },
      setViewMonth: (monthKey) => {
        if (/^\d{4}-\d{2}$/.test(monthKey)) set({ viewMonth: monthKey });
      },
      deleteMealNote: (id) => {
        set((state) => ({ mealNotes: state.mealNotes.filter((note) => note.id !== id) }));
      },
      assignDayOnlyMonth: (monthKey) => {
        const result = assignMonthToDayOnly(get().transactions, monthKey, new Date().toISOString());
        set({ transactions: result.transactions });
        return { updated: result.updated, skipped: result.skipped };
      },
      replaceAll: (data) => {
        set({
          transactions: data.transactions,
          budgets: mergeBudgets(data.budgets),
          mealNotes: data.mealNotes,
          dailyLimitPaise: data.dailyLimitPaise,
          viewMonth: data.viewMonth || currentMonthKey(),
          prefs: data.prefs,
        });
      },
    }),
    {
      name: "kasu-ledger-v3",
      storage: createJSONStorage(() => safeLocalStorage),
      version: 1,
      partialize: (state): Persisted => ({
        transactions: state.transactions,
        budgets: state.budgets,
        mealNotes: state.mealNotes,
        dailyLimitPaise: state.dailyLimitPaise,
        viewMonth: state.viewMonth,
        prefs: state.prefs,
      }),
      merge: (persisted, current) => {
        const saved = readPersisted(persisted);
        return {
          ...current,
          transactions: saved.transactions ?? current.transactions,
          budgets: mergeBudgets(saved.budgets),
          mealNotes: saved.mealNotes ?? current.mealNotes,
          dailyLimitPaise: saved.dailyLimitPaise ?? null,
          viewMonth: saved.viewMonth ?? current.viewMonth,
          prefs: saved.prefs ?? current.prefs,
        };
      },
    },
  ),
);
