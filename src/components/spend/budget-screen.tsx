import { useState } from "react";
import { budgetPlanned, budgetTone, monthStats, spentForCategories, unbudgetedCategories, usedPercent } from "@/lib/spend/calc";
import { monthLabel } from "@/lib/spend/dates";
import { formatINR, formatPercent, parseRupeesToPaise, paiseToInput } from "@/lib/spend/money";
import type { BudgetLine } from "@/lib/spend/model";
import { useSpend } from "@/lib/spend/store";
import { Card, Meter, MonthSwitcher, ScreenHeader } from "@/components/spend/ui";

export function BudgetScreen() {
  const budgets = useSpend((state) => state.budgets);
  const transactions = useSpend((state) => state.transactions);
  const viewMonth = useSpend((state) => state.viewMonth);
  const planned = budgetPlanned(budgets);
  const month = monthStats(transactions, viewMonth);
  const remaining = planned - month.spendingPaise;
  const percent = usedPercent(month.spendingPaise, planned);
  const tone = budgetTone(percent);
  const others = unbudgetedCategories(transactions, budgets);

  return (
    <div className="space-y-4 px-4">
      <ScreenHeader title="Budget" subtitle="Plans only. Editing these does not add expenses." />
      <MonthSwitcher />
      <Card>
        <p className="text-sm text-muted">Planned for a month</p>
        <p className="mt-1 text-3xl font-medium tracking-tight text-ink tabular-nums">{formatINR(planned)}</p>
        <p className={`mt-2 text-sm font-medium ${tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "text-good"}`}>
          {formatINR(month.spendingPaise)} dated to {monthLabel(viewMonth)} · {remaining >= 0 ? `${formatINR(remaining)} left` : `${formatINR(Math.abs(remaining))} over`}
        </p>
        <div className="mt-3">
          <Meter percent={percent} />
        </div>
        <p className="mt-2 text-sm text-muted">{formatPercent(percent)} of the plan. Undated lines are not included.</p>
      </Card>
      <ul className="space-y-3">
        {budgets.map((line) => (
          <BudgetRow key={line.id} line={line} monthKey={viewMonth} />
        ))}
      </ul>
      {others.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">No monthly plan</h2>
          <p className="text-sm text-muted">Still tracked. They are not part of the ₹ plan above.</p>
          {others.map((category) => (
            <OtherRow key={category} category={category} monthKey={viewMonth} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

function BudgetRow({ line, monthKey }: { line: BudgetLine; monthKey: string }) {
  const transactions = useSpend((state) => state.transactions);
  const setBudget = useSpend((state) => state.setBudget);
  const [text, setText] = useState(paiseToInput(line.plannedPaise));
  const [invalid, setInvalid] = useState(false);
  const monthSpent = spentForCategories(transactions, line.categories, { monthKey });
  const waiting = spentForCategories(transactions, line.categories, { waiting: true });
  const elsewhere = spentForCategories(transactions, line.categories, { otherThan: monthKey });
  const left = line.plannedPaise - monthSpent;
  const percent = usedPercent(monthSpent, line.plannedPaise);

  function commit(next = text) {
    const parsed = parseRupeesToPaise(next, true);
    if (parsed === null) {
      setInvalid(true);
      setText(paiseToInput(line.plannedPaise));
      return;
    }
    setInvalid(false);
    setBudget(line.id, parsed);
    setText(paiseToInput(parsed));
  }

  return (
    <li>
      <Card>
        <p className="font-medium text-ink">{line.label}</p>
        {line.hint ? <p className="mt-1 text-sm text-muted">{line.hint}</p> : null}
        <label className="mt-3 block text-sm text-muted">
          Planned amount
          <input
            inputMode="decimal"
            aria-label={`Planned amount for ${line.label}`}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setInvalid(false);
            }}
            onBlur={() => commit()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
            }}
            className="mt-2 h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink tabular-nums"
          />
        </label>
        {invalid ? <p className="mt-2 text-sm text-bad">Enter zero or a positive amount.</p> : null}
        <dl className="mt-3 space-y-1 text-sm">
          <Info label="Spent this month" value={formatINR(monthSpent)} />
          <Info label={left >= 0 ? "Remaining" : "Over"} value={formatINR(Math.abs(left))} />
          {waiting > 0 ? <Info label="Waiting on a date" value={formatINR(waiting)} /> : null}
          {elsewhere > 0 ? <Info label="Other months" value={formatINR(elsewhere)} /> : null}
        </dl>
        <div className="mt-3">
          <Meter percent={percent} />
        </div>
        <p className="mt-2 text-sm text-muted">{formatPercent(percent)} of this line, this month only.</p>
      </Card>
    </li>
  );
}

function OtherRow({ category, monthKey }: { category: string; monthKey: string }) {
  const transactions = useSpend((state) => state.transactions);
  const monthSpent = spentForCategories(transactions, [category], { monthKey });
  const waiting = spentForCategories(transactions, [category], { waiting: true });
  const elsewhere = spentForCategories(transactions, [category], { otherThan: monthKey });
  return (
    <Card>
      <p className="font-medium text-ink">{category}</p>
      <dl className="mt-2 space-y-1 text-sm">
        <Info label="This month" value={formatINR(monthSpent)} />
        {waiting > 0 ? <Info label="Waiting on a date" value={formatINR(waiting)} /> : null}
        {elsewhere > 0 ? <Info label="Other months" value={formatINR(elsewhere)} /> : null}
      </dl>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink tabular-nums">{value}</dd>
    </div>
  );
}
