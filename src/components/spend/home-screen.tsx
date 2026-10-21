import { useState } from "react";
import { budgetPlanned, budgetTone, monthStats, needsFullDate, overallTotals } from "@/lib/spend/calc";
import { currentMonthKey, daysLeftInMonth, monthLabel } from "@/lib/spend/dates";
import { buildInsights } from "@/lib/spend/insights";
import { formatINR, formatPercent } from "@/lib/spend/money";
import { useSpend } from "@/lib/spend/store";
import { Card, Meter, MonthSwitcher, TxButton } from "@/components/spend/ui";

export function HomeScreen({
  onOpen,
  onReviewDates,
}: {
  onOpen: (id: string) => void;
  onReviewDates: () => void;
}) {
  const transactions = useSpend((state) => state.transactions);
  const budgets = useSpend((state) => state.budgets);
  const viewMonth = useSpend((state) => state.viewMonth);
  const dailyLimit = useSpend((state) => state.dailyLimitPaise);
  const mealNotes = useSpend((state) => state.mealNotes);
  const deleteMealNote = useSpend((state) => state.deleteMealNote);
  const now = new Date();
  const totals = overallTotals(transactions);
  const month = monthStats(transactions, viewMonth, now);
  const planned = budgetPlanned(budgets);
  const remaining = planned - month.spendingPaise;
  const percent = planned <= 0 ? (month.spendingPaise > 0 ? 100 : 0) : Math.round((month.spendingPaise / planned) * 100);
  const tone = budgetTone(percent);
  const undated = transactions.filter(needsFullDate).length;
  const recent = transactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const insights = buildInsights(transactions, budgets, viewMonth, dailyLimit, now).slice(0, 2);
  const status = statusCopy(percent, remaining, month.spendingPaise, undated, monthLabel(viewMonth), planned);
  const daysLeft = daysLeftInMonth(viewMonth, now);
  const pace = daysLeft > 0 && remaining > 0 ? Math.round(remaining / daysLeft) : 0;
  const isCurrent = viewMonth === currentMonthKey(now);

  return (
    <div className="space-y-4 px-4 pt-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal text-base font-medium text-paper">K</span>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-ink">Kasu</h1>
            <p className="text-sm text-muted">Every rupee, once</p>
          </div>
        </div>
      </header>
      <MonthSwitcher />

      <Card>
        <p className="text-sm text-muted">
          {planned <= 0 && month.spendingPaise === 0
            ? "Nothing recorded yet"
            : remaining >= 0
              ? `Left in ${monthLabel(viewMonth)}`
              : `Over ${monthLabel(viewMonth)}`}
        </p>
        <p className={`mt-1 text-[clamp(2rem,11vw,2.25rem)] font-medium tracking-tight break-all tabular-nums ${tone === "bad" ? "text-bad" : "text-ink"}`}>
          {planned <= 0 && month.spendingPaise === 0 ? formatINR(0) : formatINR(Math.abs(remaining))}
        </p>
        <div className="mt-4">
          <Meter percent={percent} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className={`text-sm font-medium ${tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-bad"}`}>
            {status.title}
          </p>
          <p className={`rounded-md px-2 py-1 text-sm font-medium ${toneClass(tone)}`}>{formatPercent(percent)} used</p>
        </div>
        <p className="mt-2 text-sm text-muted">{status.body}</p>
        {pace > 0 ? (
          <p className="mt-2 text-sm text-ink">
            {formatINR(pace)} a day for {daysLeft} {daysLeft === 1 ? "day" : "days"} stays inside the plan.
          </p>
        ) : null}
      </Card>

      <dl className="grid grid-cols-2 gap-2">
        <Mini label="Today" value={formatINR(month.todayPaise)} />
        <Mini label="This month" value={formatINR(month.spendingPaise)} />
        <Mini label="Average / day" value={formatINR(month.averageDailyPaise)} />
        <Mini label="Days left" value={daysLeft > 0 ? String(daysLeft) : "Closed"} />
      </dl>

      {dailyLimit && isCurrent ? (
        <Card className="py-3">
          <p className="text-sm text-muted">Daily cap {formatINR(dailyLimit)}</p>
          <p className="mt-1 text-lg font-medium text-ink tabular-nums">
            {month.todayPaise > dailyLimit
              ? `${formatINR(month.todayPaise - dailyLimit)} over today`
              : `${formatINR(dailyLimit - month.todayPaise)} left today`}
          </p>
        </Card>
      ) : isCurrent && transactions.length > 0 && month.todayPaise === 0 ? (
        <p className="text-sm text-muted">Nothing dated today. The plus button takes a few seconds.</p>
      ) : null}

      <Card className="py-3">
        <p className="text-sm font-medium text-muted">All recorded</p>
        <dl className="mt-3 space-y-2 text-sm">
          <Line label="Living expenses" value={formatINR(totals.actualPaise)} />
          <Line label="Cash outflow" value={formatINR(totals.outflowPaise)} />
          <Line label="Refundable deposits" value={formatINR(totals.refundablePaise)} />
          <Line label="Entries" value={String(totals.count)} />
          <Line
            label="Largest expense"
            value={totals.largest ? `${totals.largest.item} · ${formatINR(totals.largest.amountPaise)}` : "—"}
          />
          <Line
            label="Highest category"
            value={totals.topCategory ? `${totals.topCategory.category} · ${formatINR(totals.topCategory.paise)}` : "—"}
          />
        </dl>
        {totals.refundablePaise > 0 ? (
          <p className="mt-3 text-sm text-muted">Refundable deposits are in cash outflow, not in living expenses.</p>
        ) : null}
      </Card>

      {insights.map((insight) => (
        <article key={insight.id} className={`rounded-2xl px-4 py-3 ${insightSkin(insight.tone)}`}>
          <p className="font-medium">{insight.title}</p>
          <p className="mt-1 text-sm">{insight.body}</p>
        </article>
      ))}

      {undated > 0 ? (
        <button type="button" onClick={onReviewDates} className="press w-full rounded-2xl border border-line bg-card px-4 py-3 text-left">
          <p className="font-medium text-ink">{undated} dates still incomplete</p>
          <p className="mt-1 text-sm text-muted">They count overall, not in {monthLabel(viewMonth)}. No month is guessed.</p>
        </button>
      ) : null}

      <section>
        <h2 className="mb-2 text-sm font-medium text-muted">Recent</h2>
        <Card className="py-1">
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Nothing yet. Tap plus and log the first rupee.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((tx) => (
                <li key={tx.id} className="px-1">
                  <TxButton tx={tx} onClick={() => onOpen(tx.id)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {mealNotes.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-muted">Meal notes</h2>
          <p className="mt-1 mb-2 text-sm text-muted">Not money. They never enter a total.</p>
          <ul className="space-y-2">
            {mealNotes.map((note) => (
              <MealRow key={note.id} text={note.text} onRemove={() => deleteMealNote(note.id)} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function MealRow({ text, onRemove }: { text: string; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3">
      <p className="text-sm text-ink">{text}</p>
      {confirming ? (
        <span className="flex shrink-0 gap-2">
          <button type="button" className="press h-11 text-sm font-medium text-muted" onClick={() => setConfirming(false)}>
            Keep
          </button>
          <button type="button" className="press h-11 text-sm font-medium text-bad" onClick={onRemove}>
            Remove
          </button>
        </span>
      ) : (
        <button type="button" className="press h-11 shrink-0 text-sm font-medium text-muted" onClick={() => setConfirming(true)}>
          Remove
        </button>
      )}
    </li>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper px-3 py-2">
      <p className="text-muted">{label}</p>
      <p className="font-medium text-ink tabular-nums">{value}</p>
    </div>
  );
}

function toneClass(tone: "good" | "warn" | "bad") {
  if (tone === "warn") return "bg-warn-soft text-warn";
  if (tone === "bad") return "bg-bad-soft text-bad";
  return "bg-good-soft text-good";
}

function insightSkin(tone: "info" | "warn" | "good") {
  if (tone === "warn") return "bg-warn-soft text-ink";
  if (tone === "good") return "bg-good-soft text-ink";
  return "bg-teal-soft text-ink";
}

function statusCopy(percent: number, remaining: number, spent: number, undated: number, monthName: string, planned: number) {
  if (planned <= 0 && spent === 0) {
    return {
      title: "Ready when you are",
      body: "Set a monthly amount in Budget, then tap + and log what you paid. Nothing is filled in for you.",
    };
  }
  if (planned <= 0 && spent > 0) {
    return {
      title: "No monthly plan",
      body: `${formatINR(spent)} is dated to ${monthName}. Add a plan in Budget if you want a limit.`,
    };
  }
  if (spent === 0 && undated > 0) {
    return {
      title: "Within the plan",
      body: `Nothing is dated to ${monthName} yet, so this month's spending is still zero. Older lines stay in the recorded total until you give them a month and year.`,
    };
  }
  if (percent > 100) {
    return {
      title: "Over budget",
      body: `${monthName} is over the plan by ${formatINR(Math.abs(remaining))}. Hold snacks and extra meals for the rest of the month.`,
    };
  }
  if (percent > 90) {
    return {
      title: "Almost at the limit",
      body: `${formatINR(remaining)} left in ${monthName}. Skip the next want.`,
    };
  }
  if (percent >= 70) {
    return {
      title: "Getting close",
      body: `${formatINR(remaining)} left in ${monthName}. Ease off snacks and expensive dinners.`,
    };
  }
  return {
    title: "Within budget",
    body: `${formatINR(remaining)} left in ${monthName}.`,
  };
}
