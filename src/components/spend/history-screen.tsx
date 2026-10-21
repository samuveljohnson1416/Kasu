import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, Card, ScreenHeader, SelectField, TxButton } from "@/components/spend/ui";
import { monthLabel } from "@/lib/spend/dates";
import { monthlySeries, previewMonthAssign, sortTransactions, sumPaise } from "@/lib/spend/calc";
import { formatINR } from "@/lib/spend/money";
import { CATEGORIES } from "@/lib/spend/model";
import { useSpend } from "@/lib/spend/store";

type DateScope = "all" | "needs-date" | `month:${string}`;
type NeedScope = "all" | "need" | "want" | "unassigned";
type SortKey = "newest" | "oldest" | "highest" | "lowest";

export function HistoryScreen({
  preset,
  onPresetConsumed,
  onOpen,
}: {
  preset: "needs-date" | null;
  onPresetConsumed: () => void;
  onOpen: (id: string) => void;
}) {
  const transactions = useSpend((state) => state.transactions);
  const viewMonth = useSpend((state) => state.viewMonth);
  const assign = useSpend((state) => state.assignDayOnlyMonth);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dateScope, setDateScope] = useState<DateScope>("all");
  const [exactDate, setExactDate] = useState("");
  const [need, setNeed] = useState<NeedScope>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [monthToApply, setMonthToApply] = useState("");
  const [confirmApply, setConfirmApply] = useState(false);

  useEffect(() => {
    if (preset !== "needs-date") return;
    setDateScope("needs-date");
    onPresetConsumed();
  }, [preset, onPresetConsumed]);

  const months = useMemo(() => {
    const keys = new Set(monthlySeries(transactions).map((row) => row.monthKey));
    keys.add(viewMonth);
    return [...keys].sort();
  }, [transactions, viewMonth]);

  const categories = useMemo(() => {
    const extra = transactions.map((tx) => tx.category).filter((name) => !(CATEGORIES as readonly string[]).includes(name));
    return [...new Set([...CATEGORIES, ...extra])];
  }, [transactions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = transactions.filter((tx) => {
      if (needle && !tx.item.toLowerCase().includes(needle)) return false;
      if (category !== "all" && tx.category !== category) return false;
      if (need === "need" && tx.needWant !== "need") return false;
      if (need === "want" && tx.needWant !== "want") return false;
      if (need === "unassigned" && tx.needWant !== null) return false;
      if (exactDate) return tx.date.kind === "full" && tx.date.iso === exactDate;
      if (dateScope === "needs-date") return tx.date.kind !== "full";
      if (dateScope.startsWith("month:")) {
        const monthKey = dateScope.slice(6);
        return tx.date.kind === "full" && tx.date.iso.slice(0, 7) === monthKey;
      }
      return true;
    });
    return sortTransactions(rows, sort);
  }, [transactions, query, category, need, exactDate, dateScope, sort]);

  const showingActual = sumPaise(filtered.filter((tx) => !tx.refundable));
  const showingDeposits = sumPaise(filtered.filter((tx) => tx.refundable));
  const dayOnlyCount = transactions.filter((tx) => tx.date.kind === "day-only").length;
  const unknownCount = transactions.filter((tx) => tx.date.kind === "unknown").length;
  const preview = monthToApply ? previewMonthAssign(transactions, monthToApply) : null;

  function applyMonth() {
    if (!monthToApply || !preview || preview.eligible === 0) return;
    const result = assign(monthToApply);
    setConfirmApply(false);
    toast(
      result.skipped > 0
        ? `Dated ${result.updated}. ${result.skipped} day does not exist in that month.`
        : `Dated ${result.updated} entries to ${monthLabel(monthToApply)}.`,
    );
  }

  return (
    <div className="space-y-4 px-4">
      <ScreenHeader title="Transactions" subtitle="Search, fix a date, or open a line to edit it." />
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search item name"
          aria-label="Search item name"
          className="h-12 w-full rounded-md border border-line bg-card pr-3 pl-10 text-base"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <SelectField aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </SelectField>
        <SelectField
          aria-label="Date filter"
          value={dateScope}
          onChange={(event) => setDateScope(event.target.value as DateScope)}
        >
          <option value="all">All dates</option>
          <option value="needs-date">Needs a date</option>
          {months.map((monthKey) => (
            <option key={monthKey} value={`month:${monthKey}`}>
              {monthLabel(monthKey)}
            </option>
          ))}
        </SelectField>
        <SelectField aria-label="Need or want" value={need} onChange={(event) => setNeed(event.target.value as NeedScope)}>
          <option value="all">Need and want</option>
          <option value="need">Need</option>
          <option value="want">Want</option>
          <option value="unassigned">Unassigned</option>
        </SelectField>
        <SelectField aria-label="Sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </SelectField>
      </div>
      <label className="block text-sm text-muted">
        Exact date
        <input
          type="date"
          value={exactDate}
          aria-label="Exact date"
          onChange={(event) => setExactDate(event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-line bg-card px-3 text-base text-ink"
        />
      </label>

      {dayOnlyCount > 0 ? (
        <Card>
          <p className="font-medium text-ink">{dayOnlyCount} entries have a day, but no month</p>
          <p className="mt-1 text-sm text-muted">
            {unknownCount > 0 ? `${unknownCount} more have no day at all — open those one by one. ` : ""}
            Applying a month keeps each written day. It does not invent a month on its own.
          </p>
          <label className="mt-3 block text-sm font-medium text-muted">
            Month and year
            <input
              type="month"
              value={monthToApply}
              aria-label="Month to apply"
              onChange={(event) => {
                setMonthToApply(event.target.value);
                setConfirmApply(false);
              }}
              className="mt-2 h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink"
            />
          </label>
          {confirmApply && preview ? (
            <div className="mt-3">
              <p className="text-sm text-ink">
                Set {preview.eligible} entries to {monthLabel(monthToApply)}
                {preview.skipped > 0 ? `. ${preview.skipped} will be skipped because that day is not in the month.` : "."}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary" onClick={() => setConfirmApply(false)}>
                  Back
                </Button>
                <Button type="button" onClick={applyMonth} disabled={preview.eligible === 0}>
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              className="mt-3 w-full"
              variant="secondary"
              disabled={!monthToApply}
              onClick={() => setConfirmApply(true)}
            >
              Apply to day-only entries
            </Button>
          )}
        </Card>
      ) : null}

      <p className="text-sm text-muted">
        {filtered.length} of {transactions.length} · {formatINR(showingActual)} expenses
        {showingDeposits > 0 ? ` · ${formatINR(showingDeposits)} deposits` : ""}
      </p>
      <Card className="py-1">
        {filtered.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted">Nothing matches these filters.</p>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((tx) => (
              <li key={tx.id} className="px-1">
                <TxButton tx={tx} onClick={() => onOpen(tx.id)} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
