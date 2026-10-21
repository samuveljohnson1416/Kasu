import {
  groupCategories,
  monthStats,
  previousMonthKey,
  repeatedSmallBuys,
  spentForCategories,
  splitNeedWant,
  type RepeatBuy,
} from "./calc.ts";
import { currentMonthKey, daysLeftInMonth, elapsedDays, monthLabel } from "./dates.ts";
import { formatINR } from "./money.ts";
import {
  DAILY_FOOD_CATEGORIES,
  MEAL_CATEGORIES,
  SNACKISH_CATEGORIES,
  type BudgetLine,
  type Transaction,
} from "./model.ts";

export type Insight = {
  id: string;
  tone: "info" | "warn" | "good";
  title: string;
  body: string;
};

export function buildInsights(
  transactions: Transaction[],
  budgets: BudgetLine[],
  monthKey: string,
  dailyLimitPaise: number | null,
  now = new Date(),
): Insight[] {
  const insights: Insight[] = [];
  const month = monthStats(transactions, monthKey, now);
  const actual = transactions.filter((tx) => !tx.refundable);
  const overallCategories = groupCategories(actual);

  for (const line of budgets) {
    const spent = spentForCategories(transactions, line.categories, { monthKey });
    if (line.plannedPaise > 0 && spent > line.plannedPaise) {
      insights.push({
        id: `over-${line.id}`,
        tone: "warn",
        title: `${line.label} is over the plan`,
        body: `${formatINR(spent)} dated to ${monthLabel(monthKey)} against ${formatINR(line.plannedPaise)} planned. Pause that category for the rest of the month.`,
      });
    }
  }

  const previousKey = previousMonthKey(monthKey);
  const previous = monthStats(transactions, previousKey, now);
  const elapsed = elapsedDays(monthKey, now);
  const previousElapsed = elapsedDays(previousKey, now);
  if (month.spendingPaise > 0 && previous.spendingPaise > 0 && elapsed > 0 && previousElapsed > 0) {
    const pace = month.spendingPaise / elapsed;
    const lastPace = previous.spendingPaise / previousElapsed;
    if (pace > lastPace * 1.15 && pace - lastPace >= 2000) {
      insights.push({
        id: "pace-up",
        tone: "warn",
        title: "This month is running hotter",
        body: `About ${formatINR(Math.round(pace))} a day so far, versus ${formatINR(Math.round(lastPace))} a day in ${monthLabel(previousKey)}.`,
      });
    }
  }

  const meals = actual.filter((tx) => MEAL_CATEGORIES.has(tx.category));
  const pricey = meals.slice().sort((a, b) => b.amountPaise - a.amountPaise)[0];
  if (pricey && pricey.amountPaise >= 10_000) {
    insights.push({
      id: "pricey-meal",
      tone: "info",
      title: "One meal is doing a lot of damage",
      body: `${pricey.item} was ${formatINR(pricey.amountPaise)}. A simpler plate on days like that is the easiest cut.`,
    });
  }

  const snackPaise = actual
    .filter((tx) => SNACKISH_CATEGORIES.has(tx.category))
    .reduce((sum, tx) => sum + tx.amountPaise, 0);
  const snackCount = actual.filter((tx) => SNACKISH_CATEGORIES.has(tx.category)).length;
  const dailyFood = actual
    .filter((tx) => (DAILY_FOOD_CATEGORIES as readonly string[]).includes(tx.category))
    .reduce((sum, tx) => sum + tx.amountPaise, 0);
  if (snackCount >= 3 && dailyFood > 0 && snackPaise / dailyFood >= 0.25) {
    insights.push({
      id: "snacks",
      tone: "warn",
      title: "Snacks, tea, and drinks add up",
      body: `${formatINR(snackPaise)} across ${snackCount} small buys — ${Math.round((snackPaise / dailyFood) * 100)}% of breakfast, meals, snacks, and drinks outside the fixed mess bill. Skip one extra a day.`,
    });
  }

  const repeats = repeatedSmallBuys(actual).slice(0, 3);
  if (repeats.length > 0) {
    insights.push({
      id: "repeats",
      tone: "info",
      title: "Same small buys keep returning",
      body: repeats.map((repeat) => describeRepeat(repeat)).join(" "),
    });
  }

  const top = overallCategories[0];
  const actualTotal = actual.reduce((sum, tx) => sum + tx.amountPaise, 0);
  if (top && actualTotal > 0 && top.paise / actualTotal >= 0.25) {
    insights.push({
      id: "top-category",
      tone: "info",
      title: `${top.category} is the largest share`,
      body: `${formatINR(top.paise)} of ${formatINR(actualTotal)} recorded living expenses. Everything else is smaller than this.`,
    });
  }

  if (dailyLimitPaise && dailyLimitPaise > 0 && monthKey === currentMonthKey(now)) {
    if (month.todayPaise > dailyLimitPaise) {
      insights.push({
        id: "daily-over",
        tone: "warn",
        title: "Today is over your daily cap",
        body: `${formatINR(month.todayPaise)} spent today. The cap is ${formatINR(dailyLimitPaise)}.`,
      });
    }
  }

  const needWant = splitNeedWant(actual);
  if (needWant.labeledCount >= 3 && needWant.want > needWant.need && needWant.want > 0) {
    insights.push({
      id: "wants",
      tone: "warn",
      title: "Wants are ahead of needs",
      body: `${formatINR(needWant.want)} marked as wants, ${formatINR(needWant.need)} as needs. The next snack or extra meal is the one to skip.`,
    });
  }

  if (monthKey === currentMonthKey(now) && daysLeftInMonth(monthKey, now) > 0 && month.spendingPaise === 0) {
    const dated = actual.some((tx) => tx.date.kind === "full");
    if (!dated && actual.length > 0) {
      insights.push({
        id: "no-month",
        tone: "info",
        title: "This month's plan is still untouched",
        body: "Recorded history has no complete dates, so it is not counted against this month. New spending you add today will.",
      });
    }
  }

  return insights.slice(0, 4);
}

function describeRepeat(repeat: RepeatBuy): string {
  const noun = repeat.count === 1 ? "time" : "times";
  return `${repeat.item} shows up ${repeat.count} ${noun} (${formatINR(repeat.paise)}).`;
}
