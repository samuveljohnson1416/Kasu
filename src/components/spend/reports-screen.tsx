import { useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, Card, MonthSwitcher, ScreenHeader } from "@/components/spend/ui";
import { downloadText, formatExportStamp, parseBackup, toBackup, toCsv, type BackupData } from "@/lib/spend/backup";
import {
  dailySeries,
  groupCategories,
  monthStats,
  monthlySeries,
  overallTotals,
  repeatedSmallBuys,
  splitFixed,
  splitFood,
  splitNeedWant,
  spentForCategories,
  topTransactions,
  type CategoryTotal,
} from "@/lib/spend/calc";
import { currentMonthKey, daysLeftInMonth, monthLabel, shortMonthLabel } from "@/lib/spend/dates";
import { buildInsights } from "@/lib/spend/insights";
import { formatAxis, formatINR, parseRupeesToPaise, paiseToInput } from "@/lib/spend/money";
import { describeDate } from "@/lib/spend/calc";
import { shortBudgetLabel } from "@/lib/spend/model";
import { budgetPlanned } from "@/lib/spend/calc";
import { useSpend } from "@/lib/spend/store";

type ReportTab = "charts" | "save" | "data";
type PieScope = "all" | "month";

export function ReportsScreen() {
  const [tab, setTab] = useState<ReportTab>("charts");
  return (
    <div className="space-y-4 px-4">
      <ScreenHeader title="Reports" subtitle="Ordinary spending. Refundable deposits stay in their own total." />
      <MonthSwitcher />
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-line p-1">
        {(
          [
            ["charts", "Charts"],
            ["save", "Save"],
            ["data", "Data"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`press h-11 rounded-xl text-sm font-medium ${tab === id ? "bg-card text-ink" : "text-muted"}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "charts" ? <Charts /> : null}
      {tab === "save" ? <SaveMoney /> : null}
      {tab === "data" ? <DataTools /> : null}
    </div>
  );
}

function Charts() {
  const transactions = useSpend((state) => state.transactions);
  const budgets = useSpend((state) => state.budgets);
  const viewMonth = useSpend((state) => state.viewMonth);
  const [pieScope, setPieScope] = useState<PieScope>("all");
  const actual = transactions.filter((tx) => !tx.refundable);
  const totals = overallTotals(transactions);
  const month = monthStats(transactions, viewMonth);
  const pieSource = pieScope === "all" ? groupCategories(actual) : month.byCategory;
  const months = monthlySeries(transactions);
  const days = dailySeries(transactions, viewMonth);
  const hasDaily = days.some((day) => day.paise > 0);
  const food = splitFood(pieScope === "all" ? actual : transactions.filter((tx) => !tx.refundable && tx.date.kind === "full" && tx.date.iso.startsWith(viewMonth)));
  const fixed = splitFixed(pieScope === "all" ? actual : transactions.filter((tx) => !tx.refundable && tx.date.kind === "full" && tx.date.iso.startsWith(viewMonth)));
  const needs = splitNeedWant(pieScope === "all" ? actual : transactions.filter((tx) => !tx.refundable && tx.date.kind === "full" && tx.date.iso.startsWith(viewMonth)));
  const largest = topTransactions(pieScope === "all" ? actual : transactions.filter((tx) => !tx.refundable && tx.date.kind === "full" && tx.date.iso.startsWith(viewMonth)));
  const budgetRows = budgets.map((line) => ({
    name: shortBudgetLabel(line.label),
    planned: line.plannedPaise,
    actual: spentForCategories(transactions, line.categories, { monthKey: viewMonth }),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-muted">Cash outflow</p>
        <p className="mt-1 text-3xl font-medium text-ink tabular-nums">{formatINR(totals.outflowPaise)}</p>
        <p className="mt-2 text-sm text-ink">
          {formatINR(totals.actualPaise)} living expenses + {formatINR(totals.refundablePaise)} refundable deposits.
        </p>
        <p className="mt-2 text-sm text-muted">Refundable deposits are counted here only. They are left out of the charts below.</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium text-ink">By category</h2>
          <div className="flex rounded-xl bg-paper p-1">
            <ScopeButton active={pieScope === "all"} onClick={() => setPieScope("all")}>
              All
            </ScopeButton>
            <ScopeButton active={pieScope === "month"} onClick={() => setPieScope("month")}>
              Month
            </ScopeButton>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          {pieScope === "all"
            ? "Every non-refundable entry, including ones without a full date."
            : `Only complete dates in ${monthLabel(viewMonth)}.`}
        </p>
        {pieSource.length === 0 ? (
          <Empty>No ordinary spending in this view yet.</Empty>
        ) : (
          <>
            <div className="chart-md">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={collapse(pieSource)} dataKey="paise" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={1.5} stroke="none">
                    {collapse(pieSource).map((row, index) => (
                      <Cell key={row.name} fill={`var(--color-chart-${(index % 8) + 1})`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2">
              {pieSource.map((row, index) => (
                <li key={row.category} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: `var(--color-chart-${(index % 8) + 1})` }} />
                    <span className="truncate text-ink">{row.category}</span>
                  </span>
                  <span className="shrink-0 font-medium text-ink tabular-nums">{formatINR(row.paise)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Monthly spending</h2>
        <p className="mt-1 text-sm text-muted">Complete dates only. Day-only and unknown lines are excluded.</p>
        {months.length === 0 ? (
          <Empty>No month to chart until a full date is saved.</Empty>
        ) : (
          <div className="chart-md">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={months.map((row) => ({ ...row, label: shortMonthLabel(row.monthKey) }))}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => formatAxis(Number(value))} tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} />
                <Bar dataKey="paise" fill="var(--color-teal)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Spending trend</h2>
        <p className="mt-1 text-sm text-muted">{monthLabel(viewMonth)}, by day. Refundable deposits are excluded.</p>
        {!hasDaily ? (
          <Empty>Nothing with a complete date falls in this month.</Empty>
        ) : (
          <div className="chart-md">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={days}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="day" interval={4} tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => formatAxis(Number(value))} tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} labelFormatter={(label) => `Day ${label}`} />
                <Line type="monotone" dataKey="paise" stroke="var(--color-teal)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <SplitCard title="Food and everything else" leftLabel="Food" rightLabel="Other" left={food.food} right={food.other} />
      <Card>
        <h2 className="font-medium text-ink">Needs and wants</h2>
        {needs.labeledCount === 0 ? (
          <Empty>Nothing is marked Need or Want yet. You can set that when you add an expense.</Empty>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            <Pair label="Need" value={needs.need} />
            <Pair label="Want" value={needs.want} />
            <Pair label="Unassigned" value={needs.unlabeled} />
            <ShareBar parts={[needs.need, needs.want, needs.unlabeled]} />
          </div>
        )}
      </Card>
      <Card>
        <h2 className="font-medium text-ink">Fixed and variable</h2>
        <p className="mt-1 text-sm text-muted">Fixed means rent, electricity, water, mess food, mobile recharge, and college fees.</p>
        <div className="mt-3">
          <ShareBar parts={[fixed.fixed, fixed.variable]} />
          <div className="mt-2 space-y-1 text-sm">
            <Pair label="Fixed" value={fixed.fixed} />
            <Pair label="Variable" value={fixed.variable} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Largest transactions</h2>
        {largest.length === 0 ? (
          <Empty>No ordinary expenses in this view.</Empty>
        ) : (
          <ol className="mt-3 space-y-3">
            {largest.map((tx, index) => (
              <li key={tx.id} className="flex items-start gap-3">
                <span className="w-5 text-sm text-muted tabular-nums">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{tx.item}</span>
                  <span className="block text-sm text-muted">
                    {tx.category} · {describeDate(tx)}
                  </span>
                </span>
                <span className="font-medium text-ink tabular-nums">{formatINR(tx.amountPaise)}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Plan versus actual</h2>
        <p className="mt-1 text-sm text-muted">Actual is only spending dated to {monthLabel(viewMonth)}.</p>
        <div className="chart-budget">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={budgetRows} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid stroke="var(--color-line)" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => formatAxis(Number(value))} tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={64} tick={{ fill: "var(--color-ink)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value, name) => [formatINR(Number(value ?? 0)), name === "planned" ? "Planned" : "Actual"]} />
              <Bar dataKey="planned" fill="var(--color-line)" radius={[0, 6, 6, 0]} />
              <Bar dataKey="actual" fill="var(--color-teal)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted">Grey is the plan. Teal is what is dated to this month.</p>
      </Card>
    </div>
  );
}

function SaveMoney() {
  const transactions = useSpend((state) => state.transactions);
  const budgets = useSpend((state) => state.budgets);
  const viewMonth = useSpend((state) => state.viewMonth);
  const dailyLimit = useSpend((state) => state.dailyLimitPaise);
  const setDailyLimit = useSpend((state) => state.setDailyLimit);
  const [limitText, setLimitText] = useState(dailyLimit ? paiseToInput(dailyLimit) : "");
  const [limitError, setLimitError] = useState<string | null>(null);
  const now = new Date();
  const month = monthStats(transactions, viewMonth, now);
  const planned = budgetPlanned(budgets);
  const remaining = planned - month.spendingPaise;
  const daysLeft = daysLeftInMonth(viewMonth, now);
  const pace = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0;
  const actual = transactions.filter((tx) => !tx.refundable);
  const top = groupCategories(actual).slice(0, 3);
  const repeats = repeatedSmallBuys(actual).slice(0, 4);
  const insights = buildInsights(transactions, budgets, viewMonth, dailyLimit, now);
  const totalActual = actual.reduce((sum, tx) => sum + tx.amountPaise, 0);

  function saveLimit() {
    if (!limitText.trim()) {
      setDailyLimit(null);
      setLimitError(null);
      toast("Daily cap cleared");
      return;
    }
    const parsed = parseRupeesToPaise(limitText);
    if (parsed === null) {
      setLimitError("Enter an amount above zero.");
      return;
    }
    setDailyLimit(parsed);
    setLimitError(null);
    toast("Daily cap saved");
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-medium text-ink">Daily cap</h2>
        <p className="mt-1 text-sm text-muted">Optional. Today’s ordinary spending is measured against it.</p>
        <input
          inputMode="decimal"
          aria-label="Daily spending limit"
          value={limitText}
          placeholder="For example 200"
          onChange={(event) => {
            setLimitText(event.target.value);
            setLimitError(null);
          }}
          className="mt-3 h-12 w-full rounded-md border border-line bg-paper px-3 text-base tabular-nums"
        />
        {limitError ? <p className="mt-2 text-sm text-bad">{limitError}</p> : null}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button type="button" onClick={saveLimit}>
            Save cap
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setLimitText("");
              setDailyLimit(null);
              setLimitError(null);
            }}
          >
            Clear
          </Button>
        </div>
        {dailyLimit && viewMonth === currentMonthKey(now) ? (
          <p className="mt-3 text-sm text-ink">
            Today {formatINR(month.todayPaise)} of {formatINR(dailyLimit)}.{" "}
            {month.todayPaise > dailyLimit
              ? `${formatINR(month.todayPaise - dailyLimit)} over.`
              : `${formatINR(dailyLimit - month.todayPaise)} left.`}
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Left for {monthLabel(viewMonth)}</h2>
        <p className="mt-2 text-3xl font-medium text-ink tabular-nums">
          {remaining >= 0 ? formatINR(remaining) : formatINR(remaining)}
        </p>
        {daysLeft > 0 ? (
          <p className="mt-2 text-sm text-muted">
            {remaining >= 0
              ? `${formatINR(pace)} a day for the ${daysLeft} days left keeps you inside the plan.`
              : "The plan is already used up. Further spending this month is extra."}
            {month.spendingPaise === 0 ? " This pace comes from the plan, not from dated spending." : ""}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">That month is closed.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Where recorded money went</h2>
        {top.length === 0 ? (
          <Empty>Add an expense to see this.</Empty>
        ) : (
          <ul className="mt-3 space-y-3">
            {top.map((row) => (
              <li key={row.category}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-ink">{row.category}</span>
                  <span className="font-medium text-ink tabular-nums">{formatINR(row.paise)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${totalActual ? Math.max(4, Math.round((row.paise / totalActual) * 100)) : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-medium text-ink">Repeated small purchases</h2>
        {repeats.length === 0 ? (
          <Empty>No item has been bought twice under ₹100 yet.</Empty>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {repeats.map((repeat) => (
              <li key={repeat.item} className="flex justify-between gap-3">
                <span className="text-ink">
                  {repeat.item} · {repeat.count} times
                </span>
                <span className="font-medium text-ink tabular-nums">{formatINR(repeat.paise)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {insights.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">Not enough recorded pattern to suggest a cut. Keep logging for a few days.</p>
        </Card>
      ) : (
        insights.map((insight) => (
          <article key={insight.id} className="rounded-2xl border border-line bg-card px-4 py-3">
            <p className="font-medium text-ink">{insight.title}</p>
            <p className="mt-1 text-sm text-muted">{insight.body}</p>
          </article>
        ))
      )}
    </div>
  );
}

function DataTools() {
  const transactions = useSpend((state) => state.transactions);
  const budgets = useSpend((state) => state.budgets);
  const mealNotes = useSpend((state) => state.mealNotes);
  const dailyLimitPaise = useSpend((state) => state.dailyLimitPaise);
  const viewMonth = useSpend((state) => state.viewMonth);
  const prefs = useSpend((state) => state.prefs);
  const replaceAll = useSpend((state) => state.replaceAll);
  const [pending, setPending] = useState<BackupData | null>(null);
  const [error, setError] = useState<string | null>(null);

  function exportCsv() {
    downloadText(`kasu-${formatExportStamp()}.csv`, toCsv(transactions), "text/csv;charset=utf-8");
    toast("CSV downloaded");
  }

  function exportJson() {
    const backup = toBackup({ transactions, budgets, mealNotes, dailyLimitPaise, viewMonth, prefs });
    downloadText(
      `kasu-backup-${formatExportStamp()}.json`,
      JSON.stringify(backup, null, 2),
      "application/json",
    );
    toast("Backup downloaded");
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const parsed = parseBackup(JSON.parse(await file.text()));
      if (!parsed.ok) {
        setError(parsed.error);
        setPending(null);
        return;
      }
      setPending(parsed.data);
    } catch {
      setError("That file could not be read.");
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-medium text-ink">Export</h2>
        <p className="mt-1 text-sm text-muted">CSV is the expense list. JSON is a full backup, including budgets and meal notes.</p>
        <div className="mt-3 grid gap-2">
          <Button type="button" variant="secondary" onClick={exportCsv}>
            Download CSV
          </Button>
          <Button type="button" variant="secondary" onClick={exportJson}>
            Download backup
          </Button>
        </div>
      </Card>
      <Card>
        <h2 className="font-medium text-ink">Restore</h2>
        <p className="mt-1 text-sm text-muted">Replacing data asks you to confirm first. Nothing is overwritten by opening a file.</p>
        <input
          type="file"
          accept="application/json,.json"
          aria-label="Backup file"
          className="mt-3 block w-full text-sm text-ink"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        {error ? <p className="mt-2 text-sm text-bad">{error}</p> : null}
        {pending ? (
          <div className="mt-3 rounded-2xl bg-paper p-3">
            <p className="text-sm text-ink">
              Replace {transactions.length} entries on this phone with {pending.transactions.length} from the backup?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  replaceAll(pending);
                  setPending(null);
                  toast("Backup restored");
                }}
              >
                Replace
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function collapse(rows: CategoryTotal[]): { name: string; paise: number }[] {
  if (rows.length <= 7) return rows.map((row) => ({ name: row.category, paise: row.paise }));
  const head = rows.slice(0, 6).map((row) => ({ name: row.category, paise: row.paise }));
  const rest = rows.slice(6).reduce((sum, row) => sum + row.paise, 0);
  return [...head, { name: "Other", paise: rest }];
}

function ScopeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className={`press h-9 rounded-lg px-3 text-sm font-medium ${active ? "bg-card text-ink" : "text-muted"}`}>
      {children}
    </button>
  );
}

function Empty({ children }: { children: string }) {
  return <p className="py-6 text-sm text-muted">{children}</p>;
}

function Pair({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink tabular-nums">{formatINR(value)}</span>
    </div>
  );
}

function SplitCard({
  title,
  leftLabel,
  rightLabel,
  left,
  right,
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  left: number;
  right: number;
}) {
  return (
    <Card>
      <h2 className="font-medium text-ink">{title}</h2>
      <div className="mt-3">
        <ShareBar parts={[left, right]} />
        <div className="mt-2 space-y-1 text-sm">
          <Pair label={leftLabel} value={left} />
          <Pair label={rightLabel} value={right} />
        </div>
      </div>
    </Card>
  );
}

function ShareBar({ parts }: { parts: number[] }) {
  const total = parts.reduce((sum, part) => sum + part, 0);
  const colors = ["var(--color-teal)", "var(--color-ink)", "var(--color-line)"];
  return (
    <div className="flex h-3 overflow-hidden rounded-full bg-line">
      {parts.map((part, index) => (
        <div
          key={`${index}-${part}`}
          style={{ width: total ? `${(part / total) * 100}%` : "0%", background: colors[index] ?? "var(--color-muted)" }}
        />
      ))}
    </div>
  );
}
