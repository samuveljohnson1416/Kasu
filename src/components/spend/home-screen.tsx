import { useState } from "react";
import {
  budgetPlanned,
  budgetTone,
  monthStats,
  needsFullDate,
  overallTotals,
} from "@/lib/spend/calc";
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
  const budgets      = useSpend((state) => state.budgets);
  const viewMonth    = useSpend((state) => state.viewMonth);
  const dailyLimit   = useSpend((state) => state.dailyLimitPaise);
  const mealNotes    = useSpend((state) => state.mealNotes);
  const deleteMealNote = useSpend((state) => state.deleteMealNote);

  const now      = new Date();
  const totals   = overallTotals(transactions);
  const month    = monthStats(transactions, viewMonth, now);
  const planned  = budgetPlanned(budgets);
  const remaining = planned - month.spendingPaise;
  const percent  = planned <= 0
    ? month.spendingPaise > 0 ? 100 : 0
    : Math.round((month.spendingPaise / planned) * 100);
  const tone       = budgetTone(percent);
  const undated    = transactions.filter(needsFullDate).length;
  const recent     = transactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const insights   = buildInsights(transactions, budgets, viewMonth, dailyLimit, now).slice(0, 2);
  const status     = statusCopy(percent, remaining, month.spendingPaise, undated, monthLabel(viewMonth), planned);
  const daysLeft   = daysLeftInMonth(viewMonth, now);
  const pace       = daysLeft > 0 && remaining > 0 ? Math.round(remaining / daysLeft) : 0;
  const isCurrent  = viewMonth === currentMonthKey(now);

  return (
    <div className="space-y-3 px-4 pt-5 pb-2">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <span className="relative grid size-9 place-items-center rounded-sm bg-teal glow-amber overflow-hidden">
            <span className="stripe absolute inset-0" />
            <span className="relative font-bold text-[#0d0d0d] text-base leading-none">K</span>
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-ink leading-none">KASU</h1>
            <p className="section-tag mt-0.5">expense tracker</p>
          </div>
        </div>
        {isCurrent && (
          <span className="section-tag rounded-sm border border-teal/30 bg-teal/10 px-2 py-1 text-teal">
            LIVE
          </span>
        )}
      </header>

      <MonthSwitcher />

      {/* ── Hero balance card ────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="section-tag mb-1">
              {planned <= 0 && month.spendingPaise === 0
                ? "Nothing recorded yet"
                : remaining >= 0
                  ? `Left in ${monthLabel(viewMonth)}`
                  : `Over ${monthLabel(viewMonth)}`}
            </p>
            <p
              className={`mono text-[clamp(2rem,11vw,2.5rem)] font-bold tracking-tight leading-none tabular-nums break-all ${
                tone === "bad" ? "text-bad" : "text-ink"
              }`}
            >
              {planned <= 0 && month.spendingPaise === 0
                ? formatINR(0)
                : formatINR(Math.abs(remaining))}
            </p>
          </div>
          <span
            className={`mono shrink-0 rounded-sm px-2 py-1 text-xs font-semibold tabular-nums ${toneChip(tone)}`}
          >
            {formatPercent(percent)}
          </span>
        </div>

        <div className="mt-4">
          <Meter percent={percent} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className={`text-sm font-semibold ${toneText(tone)}`}>{status.title}</p>
        </div>
        <p className="mt-1 text-xs text-muted leading-relaxed">{status.body}</p>
        {pace > 0 ? (
          <p className="mono mt-2 text-xs text-muted">
            ≈ {formatINR(pace)}/day for {daysLeft} {daysLeft === 1 ? "day" : "days"}
          </p>
        ) : null}
      </Card>

      {/* ── Stat grid ───────────────────────────────────────────────── */}
      <dl className="grid grid-cols-2 gap-2">
        <StatCell label="Today"        value={formatINR(month.todayPaise)} />
        <StatCell label="This month"   value={formatINR(month.spendingPaise)} />
        <StatCell label="Avg / day"    value={formatINR(month.averageDailyPaise)} />
        <StatCell label="Days left"    value={daysLeft > 0 ? String(daysLeft) : "Closed"} />
      </dl>

      {/* ── Daily cap card ──────────────────────────────────────────── */}
      {dailyLimit && isCurrent ? (
        <Card className="p-3">
          <p className="section-tag mb-1">Daily cap · {formatINR(dailyLimit)}</p>
          <p className={`mono text-base font-bold tabular-nums ${month.todayPaise > dailyLimit ? "text-bad" : "text-good"}`}>
            {month.todayPaise > dailyLimit
              ? `${formatINR(month.todayPaise - dailyLimit)} over`
              : `${formatINR(dailyLimit - month.todayPaise)} left`}
          </p>
        </Card>
      ) : isCurrent && transactions.length > 0 && month.todayPaise === 0 ? (
        <p className="mono text-xs text-muted px-1">Nothing dated today.</p>
      ) : null}

      {/* ── All-time totals ──────────────────────────────────────────── */}
      <Card className="p-4">
        <p className="section-tag mb-3">All recorded</p>
        <dl className="space-y-2">
          <StatRow label="Living expenses"      value={formatINR(totals.actualPaise)} />
          <StatRow label="Cash outflow"         value={formatINR(totals.outflowPaise)} />
          <StatRow label="Refundable deposits"  value={formatINR(totals.refundablePaise)} />
          <StatRow label="Entries"              value={String(totals.count)} />
          <StatRow
            label="Largest expense"
            value={totals.largest ? `${totals.largest.item} · ${formatINR(totals.largest.amountPaise)}` : "—"}
          />
          <StatRow
            label="Top category"
            value={totals.topCategory ? `${totals.topCategory.category} · ${formatINR(totals.topCategory.paise)}` : "—"}
          />
        </dl>
        {totals.refundablePaise > 0 ? (
          <p className="mt-3 text-xs text-muted">Refundable deposits are in cash outflow, not living expenses.</p>
        ) : null}
      </Card>

      {/* ── Insights ─────────────────────────────────────────────────── */}
      {insights.map((insight) => (
        <article
          key={insight.id}
          className={`rounded-sm border px-4 py-3 ${insightSkin(insight.tone)}`}
        >
          <p className="text-sm font-semibold">{insight.title}</p>
          <p className="mt-1 text-xs leading-relaxed">{insight.body}</p>
        </article>
      ))}

      {/* ── Undated alert ────────────────────────────────────────────── */}
      {undated > 0 ? (
        <button
          type="button"
          onClick={onReviewDates}
          className="press w-full rounded-sm border border-warn/30 bg-warn-soft px-4 py-3 text-left"
        >
          <p className="text-sm font-semibold text-warn">{undated} dates incomplete</p>
          <p className="mt-1 text-xs text-muted/80">
            They count overall, not in {monthLabel(viewMonth)}. Tap to review.
          </p>
        </button>
      ) : null}

      {/* ── Recent transactions ──────────────────────────────────────── */}
      <section>
        <p className="section-tag mb-2 px-0.5">Recent</p>
        <Card className="py-1 px-3">
          {recent.length === 0 ? (
            <p className="mono py-6 text-center text-xs text-muted">
              Nothing yet. Tap + and log the first rupee.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((tx) => (
                <li key={tx.id}>
                  <TxButton tx={tx} onClick={() => onOpen(tx.id)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* ── Meal notes ───────────────────────────────────────────────── */}
      {mealNotes.length > 0 ? (
        <section className="pb-2">
          <p className="section-tag mb-1.5 px-0.5">Meal notes</p>
          <p className="mb-2 text-xs text-muted">Not money — never enter a total.</p>
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

// ── Sub-components ────────────────────────────────────────────────────────────

function MealRow({ text, onRemove }: { text: string; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="flex items-center justify-between gap-3 rounded-sm border border-line bg-card px-4 py-3">
      <p className="text-sm text-ink">{text}</p>
      {confirming ? (
        <span className="flex shrink-0 gap-3">
          <button
            type="button"
            className="press text-xs font-semibold text-muted hover:text-ink"
            onClick={() => setConfirming(false)}
          >
            Keep
          </button>
          <button
            type="button"
            className="press text-xs font-semibold text-bad"
            onClick={onRemove}
          >
            Remove
          </button>
        </span>
      ) : (
        <button
          type="button"
          className="press shrink-0 text-xs font-semibold text-muted hover:text-ink"
          onClick={() => setConfirming(true)}
        >
          Remove
        </button>
      )}
    </li>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mono text-right text-sm font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-line bg-card px-3 py-2.5">
      <p className="section-tag mb-1">{label}</p>
      <p className="mono text-base font-bold text-ink tabular-nums">{value}</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toneText(tone: "good" | "warn" | "bad") {
  if (tone === "warn") return "text-warn";
  if (tone === "bad")  return "text-bad";
  return "text-good";
}

function toneChip(tone: "good" | "warn" | "bad") {
  if (tone === "warn") return "bg-warn-soft text-warn border border-warn/20";
  if (tone === "bad")  return "bg-bad-soft  text-bad  border border-bad/20";
  return "bg-good-soft text-good border border-good/20";
}

function insightSkin(tone: "info" | "warn" | "good") {
  if (tone === "warn") return "border-warn/20 bg-warn-soft text-ink";
  if (tone === "good") return "border-good/20 bg-good-soft text-ink";
  return "border-teal/20 bg-teal-soft text-ink";
}

function statusCopy(
  percent: number,
  remaining: number,
  spent: number,
  undated: number,
  monthName: string,
  planned: number,
) {
  if (planned <= 0 && spent === 0)
    return { title: "Ready when you are", body: "Set a monthly amount in Budget, then tap + to log." };
  if (planned <= 0 && spent > 0)
    return { title: "No monthly plan", body: `${formatINR(spent)} dated to ${monthName}. Add a plan in Budget.` };
  if (spent === 0 && undated > 0)
    return { title: "Within the plan", body: `Nothing dated to ${monthName} yet. Older entries stay in the total.` };
  if (percent > 100)
    return { title: "Over budget", body: `${monthName} is over by ${formatINR(Math.abs(remaining))}.` };
  if (percent > 90)
    return { title: "Almost at the limit", body: `${formatINR(remaining)} left in ${monthName}.` };
  if (percent >= 70)
    return { title: "Getting close", body: `${formatINR(remaining)} left in ${monthName}. Ease off.` };
  return { title: "Within budget", body: `${formatINR(remaining)} left in ${monthName}.` };
}
