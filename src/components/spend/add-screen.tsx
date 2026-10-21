import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Field, ScreenHeader, TextArea, TextField } from "@/components/spend/ui";
import { todayISO } from "@/lib/spend/dates";
import { isRealISODate } from "@/lib/spend/dates";
import { formatINR, parseRupeesToPaise, paiseToInput } from "@/lib/spend/money";
import { CATEGORIES, isKnownCategory, PAYMENT_OPTIONS, type PaymentMethod, type Transaction, type TxDate } from "@/lib/spend/model";
import { useSpend, type Draft } from "@/lib/spend/store";

type DateMode = "full" | "day-only" | "unknown";

const DAILY = ["Breakfast", "Lunch", "Dinner", "Snacks", "Tea and Coffee", "Drinks", "Transport", "Mess Food"];

function repeatKey(tx: Transaction): string {
  return `${tx.item.trim().toLowerCase()}|${tx.category}|${tx.amountPaise}`;
}

type FormState = {
  item: string;
  amount: string;
  category: string;
  payment: PaymentMethod | null;
  need: "need" | "want" | null;
  refundable: boolean;
  notes: string;
  dateMode: DateMode;
  iso: string;
  day: string;
};

function blankForm(category: string, payment: PaymentMethod | null): FormState {
  return {
    item: "",
    amount: "",
    category,
    payment,
    need: null,
    refundable: false,
    notes: "",
    dateMode: "full",
    iso: todayISO(),
    day: String(new Date().getDate()),
  };
}

function fromTransaction(id: string): FormState | null {
  const tx = useSpend.getState().transactions.find((item) => item.id === id);
  if (!tx) return null;
  return {
    item: tx.item,
    amount: paiseToInput(tx.amountPaise),
    category: tx.category,
    payment: tx.paymentMethod,
    need: tx.needWant,
    refundable: tx.refundable,
    notes: tx.notes,
    dateMode: tx.date.kind,
    iso: tx.date.kind === "full" ? tx.date.iso : todayISO(),
    day: tx.date.kind === "day-only" ? String(tx.date.day) : String(new Date().getDate()),
  };
}

export function AddScreen({
  active,
  editingId,
  onSavedEdit,
}: {
  active: boolean;
  editingId: string | null;
  onSavedEdit: () => void;
}) {
  const prefs = useSpend((state) => state.prefs);
  const transactions = useSpend((state) => state.transactions);
  const addTransaction = useSpend((state) => state.addTransaction);
  const updateTransaction = useSpend((state) => state.updateTransaction);
  const amountRef = useRef<HTMLInputElement>(null);
  const itemRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(() => blankForm("", null));
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const prefsNow = useSpend.getState().prefs;
    if (editingId) {
      setForm(fromTransaction(editingId) ?? blankForm(prefsNow.recentCategories[0] ?? "", prefsNow.lastPayment));
    } else {
      setForm(blankForm(prefsNow.recentCategories[0] ?? "", prefsNow.lastPayment));
    }
    setError(null);
    setShowAll(false);
    setShowMore(Boolean(editingId));
  }, [editingId]);

  useEffect(() => {
    if (!active) return;
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => {
      if (editingId) itemRef.current?.focus();
      else amountRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [active, editingId]);

  const amountPaise = parseRupeesToPaise(form.amount);
  const amountHint =
    form.amount.trim() && amountPaise === null ? "Use a number above zero, like 40 or 62.83." : null;

  const repeats = useMemo(() => {
    const sorted = transactions.filter((tx) => !tx.refundable).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const seen = new Set<string>();
    const rows: Transaction[] = [];
    for (const tx of sorted) {
      const key = repeatKey(tx);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(tx);
      if (rows.length === 6) break;
    }
    return rows;
  }, [transactions]);

  const quickCategories = useMemo(() => {
    const picked = [
      ...prefs.recentCategories.filter((category) => isKnownCategory(category) || category === form.category),
      ...DAILY,
    ];
    if (form.category) picked.unshift(form.category);
    return [...new Set(picked)].slice(0, 8);
  }, [prefs.recentCategories, form.category]);

  const ordered = [
    ...prefs.recentCategories.filter((category) => isKnownCategory(category) || category === form.category),
    ...CATEGORIES.filter((category) => !prefs.recentCategories.includes(category)),
  ];
  if (form.category && !ordered.includes(form.category)) ordered.unshift(form.category);
  const visibleCategories = showAll ? ordered : quickCategories;

  function patch(partial: Partial<FormState>) {
    setForm((current) => ({ ...current, ...partial }));
    setError(null);
  }

  function buildDraft(): Draft | null {
    if (!form.item.trim()) {
      setError("Add what you paid for.");
      return null;
    }
    if (amountPaise === null) {
      setError("Enter an amount above zero. Paise are allowed, negatives are not.");
      return null;
    }
    if (!form.category) {
      setError("Choose a category.");
      return null;
    }
    let date: TxDate;
    if (form.dateMode === "unknown") {
      date = { kind: "unknown" };
    } else if (form.dateMode === "day-only") {
      const day = Number(form.day);
      if (!Number.isInteger(day) || day < 1 || day > 31) {
        setError("Day must be between 1 and 31. Leave the month blank rather than guessing it.");
        return null;
      }
      date = { kind: "day-only", day };
    } else {
      if (!isRealISODate(form.iso)) {
        setError("Choose a real date, or mark it unknown.");
        return null;
      }
      date = { kind: "full", iso: form.iso };
    }
    return {
      item: form.item.trim(),
      amountPaise,
      category: form.category,
      paymentMethod: form.payment,
      needWant: form.need,
      refundable: form.refundable,
      notes: form.notes.trim(),
      date,
    };
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const draft = buildDraft();
    if (!draft) return;
    if (editingId) {
      updateTransaction(editingId, draft);
      toast(`Updated ${draft.item}`);
      onSavedEdit();
      return;
    }
    addTransaction(draft);
    try {
      navigator.vibrate?.(12);
    } catch {
      /* optional */
    }
    toast(`Saved ${draft.item}`);
    const nextPrefs = useSpend.getState().prefs;
    setForm(blankForm(nextPrefs.recentCategories[0] ?? draft.category, nextPrefs.lastPayment));
    window.scrollTo(0, 0);
    itemRef.current?.focus();
  }

  function applyRepeat(tx: Transaction) {
    patch({
      item: tx.item,
      amount: paiseToInput(tx.amountPaise),
      category: tx.category,
      payment: tx.paymentMethod,
      need: tx.needWant,
      refundable: false,
      notes: "",
    });
    amountRef.current?.focus();
  }

  return (
    <form onSubmit={onSubmit} className="pad-nav-form px-4">
      <ScreenHeader
        title={editingId ? "Edit" : "Add"}
        subtitle={editingId ? "Saving updates every total." : "Amount, what it was, save."}
      />
      <div className="space-y-5">
        {!editingId && repeats.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-muted">Again</p>
            <div className="chip-row -mx-4 px-4">
              {repeats.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  className="press h-11 shrink-0 rounded-full border border-line bg-card px-3 text-sm font-medium text-ink"
                  onClick={() => applyRepeat(tx)}
                >
                  {tx.item} · {formatINR(tx.amountPaise)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="expense-amount" className="mb-1 block text-sm font-medium text-muted">
            Amount
          </label>
          <div className="flex items-baseline gap-1 border-b border-line">
            <span className="text-3xl font-medium text-muted">₹</span>
            <input
              ref={amountRef}
              id="expense-amount"
              inputMode="decimal"
              enterKeyHint="next"
              value={form.amount}
              placeholder="0"
              aria-label="Amount in rupees"
              autoComplete="off"
              className="h-16 min-w-0 w-full bg-transparent text-[clamp(2rem,10vw,2.25rem)] font-medium text-ink tabular-nums"
              onChange={(event) => patch({ amount: event.target.value })}
            />
          </div>
          {amountHint ? <p className="mt-2 text-sm text-bad">{amountHint}</p> : null}
        </div>

        <Field label="What">
          <TextField
            ref={itemRef}
            id="expense-item"
            value={form.item}
            placeholder="Tea, dosa, rent"
            maxLength={80}
            autoComplete="off"
            enterKeyHint="done"
            onChange={(event) => patch({ item: event.target.value })}
          />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-muted">Category</legend>
          <div className={showAll ? "grid grid-cols-2 gap-2" : "chip-row -mx-4 px-4"}>
            {visibleCategories.map((category) => {
              const selected = form.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  className={`press shrink-0 border text-sm font-medium ${
                    showAll ? "min-h-11 rounded-xl px-3 text-left" : "h-11 rounded-full px-3"
                  } ${selected ? "border-teal bg-teal-soft text-teal" : "border-line bg-card text-ink"}`}
                  onClick={() => patch({ category })}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <button type="button" className="press mt-2 h-11 text-sm font-medium text-teal" onClick={() => setShowAll((open) => !open)}>
            {showAll ? "Fewer categories" : "All categories"}
          </button>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-muted">Need or want</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["need", "want"] as const).map((value) => {
              const selected = form.need === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  className={`press min-h-12 rounded-xl border text-sm font-medium ${
                    selected ? "border-teal bg-teal-soft text-teal" : "border-line bg-card text-ink"
                  }`}
                  onClick={() => patch({ need: selected ? null : value })}
                >
                  {value === "need" ? "Need" : "Want"}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-muted">Payment</legend>
          <div className="chip-row">
            {PAYMENT_OPTIONS.map((option) => {
              const selected = form.payment === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  className={`press h-11 shrink-0 rounded-full border px-3 text-sm font-medium ${
                    selected ? "border-teal bg-teal-soft text-teal" : "border-line bg-card text-ink"
                  }`}
                  onClick={() => patch({ payment: selected ? null : option.id })}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Date</p>
          {form.dateMode === "full" ? (
            <TextField type="date" aria-label="Date" value={form.iso} onChange={(event) => patch({ iso: event.target.value })} />
          ) : null}
          {form.dateMode === "day-only" ? (
            <TextField
              inputMode="numeric"
              value={form.day}
              aria-label="Day of month"
              onChange={(event) => patch({ day: event.target.value.replace(/\D/g, "").slice(0, 2) })}
            />
          ) : null}
          {form.dateMode === "unknown" ? <p className="text-sm text-ink">No date will be stored.</p> : null}
        </div>

        <button type="button" className="press h-11 text-sm font-medium text-teal" onClick={() => setShowMore((open) => !open)}>
          {showMore ? "Hide extras" : "Deposit, notes, incomplete date"}
        </button>

        {showMore ? (
          <div className="space-y-5">
            <span className="flex flex-wrap gap-2">
              {form.dateMode !== "full" ? (
                <MiniToggle onClick={() => patch({ dateMode: "full" })}>Use a full date</MiniToggle>
              ) : null}
              {form.dateMode !== "day-only" ? (
                <MiniToggle onClick={() => patch({ dateMode: "day-only" })}>Only the day</MiniToggle>
              ) : null}
              {form.dateMode !== "unknown" ? (
                <MiniToggle onClick={() => patch({ dateMode: "unknown" })}>Date unknown</MiniToggle>
              ) : null}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={form.refundable}
              className="press flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 text-left"
              onClick={() => patch({ refundable: !form.refundable })}
            >
              <span>
                <span className="block font-medium text-ink">Refundable deposit</span>
                <span className="block text-sm text-muted">Cash out only. Not a living expense.</span>
              </span>
              <span className={`h-7 w-12 shrink-0 rounded-full p-1 ${form.refundable ? "bg-teal" : "bg-line"}`}>
                <span className={`block size-5 rounded-full bg-card ${form.refundable ? "ml-auto" : ""}`} />
              </span>
            </button>
            <Field label="Notes">
              <TextArea
                value={form.notes}
                maxLength={280}
                placeholder="Optional"
                onChange={(event) => patch({ notes: event.target.value })}
              />
            </Field>
          </div>
        ) : null}
      </div>

      <div className="save-bar border-t border-line bg-paper px-4 py-3">
        <div className="mx-auto max-w-md">
          {error ? (
            <p role="alert" className="mb-2 text-sm font-medium text-bad">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            {editingId ? "Save changes" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function MiniToggle({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" className="press h-11 rounded-md px-2 text-sm font-medium text-teal" onClick={onClick}>
      {children}
    </button>
  );
}
