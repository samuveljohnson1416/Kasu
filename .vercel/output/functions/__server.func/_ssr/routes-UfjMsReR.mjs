import { i as __toESM } from "../_runtime.mjs";
import { K as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as Plus, c as ChevronRight, i as Search, l as ChevronLeft, n as Wallet, o as List, s as House, t as X, u as ChartPie } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-UfjMsReR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function currentMonthKey(now = /* @__PURE__ */ new Date()) {
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
function todayISO(now = /* @__PURE__ */ new Date()) {
	return `${currentMonthKey(now)}-${String(now.getDate()).padStart(2, "0")}`;
}
function shiftMonth(monthKey, delta) {
	const [y, m] = monthKey.split("-").map(Number);
	return currentMonthKey(new Date(y, m - 1 + delta, 1));
}
function monthLabel(monthKey) {
	const [y, m] = monthKey.split("-").map(Number);
	return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
		month: "long",
		year: "numeric"
	});
}
function shortMonthLabel(monthKey) {
	const [y, m] = monthKey.split("-").map(Number);
	return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
		month: "short",
		year: "2-digit"
	});
}
function daysInMonth(monthKey) {
	const [y, m] = monthKey.split("-").map(Number);
	return new Date(y, m, 0).getDate();
}
function elapsedDays(monthKey, now = /* @__PURE__ */ new Date()) {
	const current = currentMonthKey(now);
	if (monthKey < current) return daysInMonth(monthKey);
	if (monthKey > current) return 0;
	return now.getDate();
}
function daysLeftInMonth(monthKey, now = /* @__PURE__ */ new Date()) {
	const current = currentMonthKey(now);
	if (monthKey < current) return 0;
	if (monthKey > current) return daysInMonth(monthKey);
	return daysInMonth(monthKey) - now.getDate() + 1;
}
function isRealISODate(iso) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return false;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (month < 1 || month > 12) return false;
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function composeISO(monthKey, day) {
	if (!/^\d{4}-\d{2}$/.test(monthKey)) return null;
	if (!Number.isInteger(day) || day < 1 || day > 31) return null;
	const iso = `${monthKey}-${String(day).padStart(2, "0")}`;
	return isRealISODate(iso) ? iso : null;
}
var CATEGORIES = [
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
	"Miscellaneous"
];
var FOOD_CATEGORIES = /* @__PURE__ */ new Set([
	"Mess Food",
	"Breakfast",
	"Lunch",
	"Dinner",
	"Snacks",
	"Tea and Coffee",
	"Drinks",
	"Groceries",
	"Food"
]);
var DAILY_FOOD_CATEGORIES = [
	"Breakfast",
	"Lunch",
	"Dinner",
	"Snacks",
	"Tea and Coffee",
	"Drinks"
];
var SNACKISH_CATEGORIES = /* @__PURE__ */ new Set([
	"Snacks",
	"Tea and Coffee",
	"Drinks"
]);
var MEAL_CATEGORIES = /* @__PURE__ */ new Set([
	"Breakfast",
	"Lunch",
	"Dinner"
]);
var FIXED_CATEGORIES = /* @__PURE__ */ new Set([
	"Rent",
	"Electricity",
	"Water",
	"Mobile Recharge",
	"College Fees",
	"Mess Food"
]);
var PAYMENT_OPTIONS = [
	{
		id: "cash",
		label: "Cash"
	},
	{
		id: "upi",
		label: "UPI"
	},
	{
		id: "card",
		label: "Card"
	},
	{
		id: "bank",
		label: "Bank Transfer"
	},
	{
		id: "unspecified",
		label: "Not Specified"
	}
];
var DEFAULT_PREFS = {
	recentCategories: [],
	lastPayment: null
};
var DEFAULT_BUDGETS = [
	{
		id: "rent",
		label: "Rent",
		categories: ["Rent"],
		plannedPaise: 3e5
	},
	{
		id: "electricity",
		label: "Electricity",
		categories: ["Electricity"],
		plannedPaise: 2e4
	},
	{
		id: "water",
		label: "Water",
		categories: ["Water"],
		plannedPaise: 1e4
	},
	{
		id: "mess",
		label: "Mess Food — Lunch and Dinner",
		categories: [
			"Mess Food",
			"Lunch",
			"Dinner"
		],
		plannedPaise: 463e3,
		hint: "Starting estimate: ₹4,500 food + ₹130 delivery for 26 days. Covers mess, lunch, and dinner."
	},
	{
		id: "breakfast",
		label: "Breakfast",
		categories: ["Breakfast"],
		plannedPaise: 15e4
	},
	{
		id: "snacks",
		label: "Snacks",
		categories: ["Snacks"],
		plannedPaise: 12e4
	},
	{
		id: "transport",
		label: "Transport",
		categories: ["Transport"],
		plannedPaise: 5e4
	},
	{
		id: "mobile",
		label: "Mobile Recharge",
		categories: ["Mobile Recharge"],
		plannedPaise: 3e4
	},
	{
		id: "toiletries",
		label: "Toiletries",
		categories: ["Toiletries"],
		plannedPaise: 4e4
	},
	{
		id: "laundry",
		label: "Laundry",
		categories: ["Laundry"],
		plannedPaise: 25e3
	},
	{
		id: "medical",
		label: "Medical",
		categories: ["Medical"],
		plannedPaise: 3e4
	},
	{
		id: "stationery",
		label: "Stationery",
		categories: ["Stationery"],
		plannedPaise: 2e4
	},
	{
		id: "misc",
		label: "Miscellaneous",
		categories: ["Miscellaneous"],
		plannedPaise: 1e5
	}
];
function isKnownCategory(value) {
	return CATEGORIES.includes(value);
}
function paymentLabel(value) {
	if (!value) return "Unassigned";
	return PAYMENT_OPTIONS.find((option) => option.id === value)?.label ?? "Unassigned";
}
function needLabel(value) {
	if (value === "need") return "Need";
	if (value === "want") return "Want";
	return "Unassigned";
}
function isPaymentMethod(value) {
	return PAYMENT_OPTIONS.some((option) => option.id === value);
}
function isTxDate(value) {
	if (!value || typeof value !== "object") return false;
	const date = value;
	if (date.kind === "unknown") return true;
	if (date.kind === "day-only") return Number.isInteger(date.day) && date.day >= 1 && date.day <= 31;
	if (date.kind === "full") return typeof date.iso === "string" && isRealISODate(date.iso);
	return false;
}
function isTransaction(value) {
	if (!value || typeof value !== "object") return false;
	const tx = value;
	return typeof tx.id === "string" && tx.id.length > 0 && typeof tx.item === "string" && tx.item.trim().length > 0 && Number.isSafeInteger(tx.amountPaise) && tx.amountPaise > 0 && typeof tx.category === "string" && tx.category.trim().length > 0 && (tx.paymentMethod === null || isPaymentMethod(tx.paymentMethod)) && (tx.needWant === null || tx.needWant === "need" || tx.needWant === "want") && typeof tx.refundable === "boolean" && typeof tx.notes === "string" && isTxDate(tx.date) && typeof tx.createdAt === "string" && typeof tx.updatedAt === "string";
}
function budgetedCategories(budgets) {
	return new Set(budgets.flatMap((line) => line.categories));
}
function shortBudgetLabel(label) {
	if (label.startsWith("Mess Food")) return "Mess";
	if (label === "Tea and Coffee") return "Tea";
	if (label === "Mobile Recharge") return "Mobile";
	if (label === "Household Items") return "Household";
	if (label === "Advance Deposit") return "Advance";
	if (label === "College Fees") return "College";
	return label;
}
function isActual(tx) {
	return !tx.refundable;
}
function sumPaise(transactions) {
	return transactions.reduce((sum, tx) => sum + tx.amountPaise, 0);
}
function groupCategories(transactions) {
	const map = /* @__PURE__ */ new Map();
	for (const tx of transactions) {
		const current = map.get(tx.category) ?? {
			category: tx.category,
			paise: 0,
			count: 0
		};
		current.paise += tx.amountPaise;
		current.count += 1;
		map.set(tx.category, current);
	}
	return [...map.values()].sort((a, b) => b.paise - a.paise || a.category.localeCompare(b.category));
}
function pickLargest(transactions) {
	let best = null;
	for (const tx of transactions) if (!best || tx.amountPaise > best.amountPaise || tx.amountPaise === best.amountPaise && tx.createdAt > best.createdAt) best = tx;
	return best;
}
function overallTotals(transactions) {
	const actual = transactions.filter(isActual);
	const refundable = transactions.filter((tx) => tx.refundable);
	const categories = groupCategories(actual);
	return {
		actualPaise: sumPaise(actual),
		refundablePaise: sumPaise(refundable),
		outflowPaise: sumPaise(transactions),
		count: transactions.length,
		largest: pickLargest(actual),
		topCategory: categories[0] ?? null
	};
}
function inSelectedMonth(tx, monthKey) {
	return tx.date.kind === "full" && tx.date.iso.slice(0, 7) === monthKey;
}
function monthStats(transactions, monthKey, now = /* @__PURE__ */ new Date()) {
	const inMonth = transactions.filter((tx) => inSelectedMonth(tx, monthKey));
	const spending = inMonth.filter(isActual);
	const deposits = inMonth.filter((tx) => tx.refundable);
	const today = todayISO(now);
	const todayRows = spending.filter((tx) => tx.date.kind === "full" && tx.date.iso === today);
	const todayDeposits = deposits.filter((tx) => tx.date.kind === "full" && tx.date.iso === today);
	const categories = groupCategories(spending);
	const elapsed = elapsedDays(monthKey, now);
	return {
		spendingPaise: sumPaise(spending),
		refundablePaise: sumPaise(deposits),
		todayPaise: sumPaise(todayRows),
		todayDepositPaise: sumPaise(todayDeposits),
		averageDailyPaise: elapsed > 0 ? Math.round(sumPaise(spending) / elapsed) : 0,
		count: inMonth.length,
		largest: pickLargest(spending),
		topCategory: categories[0] ?? null,
		byCategory: categories
	};
}
function budgetPlanned(budgets) {
	return budgets.reduce((sum, line) => sum + line.plannedPaise, 0);
}
function usedPercent(spentPaise, plannedPaise) {
	if (plannedPaise <= 0) return spentPaise > 0 ? 100 : 0;
	return Math.round(spentPaise / plannedPaise * 100);
}
function budgetTone(percent) {
	if (percent > 90) return "bad";
	if (percent >= 70) return "warn";
	return "good";
}
function spentForCategories(transactions, categories, scope) {
	const wanted = new Set(categories);
	return transactions.reduce((sum, tx) => {
		if (!isActual(tx) || !wanted.has(tx.category)) return sum;
		if ("monthKey" in scope) return inSelectedMonth(tx, scope.monthKey) ? sum + tx.amountPaise : sum;
		if ("waiting" in scope) return tx.date.kind === "full" ? sum : sum + tx.amountPaise;
		return tx.date.kind === "full" && tx.date.iso.slice(0, 7) !== scope.otherThan ? sum + tx.amountPaise : sum;
	}, 0);
}
function repeatedSmallBuys(transactions, maxEach = 1e4) {
	const groups = /* @__PURE__ */ new Map();
	for (const tx of transactions) {
		if (!isActual(tx)) continue;
		const key = tx.item.trim().toLowerCase().replace(/\s+/g, " ");
		if (!key) continue;
		const current = groups.get(key) ?? {
			item: tx.item.trim(),
			count: 0,
			paise: 0,
			small: true
		};
		current.count += 1;
		current.paise += tx.amountPaise;
		if (tx.amountPaise > maxEach) current.small = false;
		groups.set(key, current);
	}
	return [...groups.values()].filter((group) => group.count >= 2 && group.small).map(({ item, count, paise }) => ({
		item,
		count,
		paise
	})).sort((a, b) => b.paise - a.paise || b.count - a.count || a.item.localeCompare(b.item));
}
function splitFood(transactions) {
	const actual = transactions.filter(isActual);
	const food = sumPaise(actual.filter((tx) => FOOD_CATEGORIES.has(tx.category)));
	return {
		food,
		other: sumPaise(actual) - food
	};
}
function splitFixed(transactions) {
	const actual = transactions.filter(isActual);
	const fixed = sumPaise(actual.filter((tx) => FIXED_CATEGORIES.has(tx.category)));
	return {
		fixed,
		variable: sumPaise(actual) - fixed
	};
}
function splitNeedWant(transactions) {
	const actual = transactions.filter(isActual);
	return {
		need: sumPaise(actual.filter((tx) => tx.needWant === "need")),
		want: sumPaise(actual.filter((tx) => tx.needWant === "want")),
		unlabeled: sumPaise(actual.filter((tx) => tx.needWant === null)),
		labeledCount: actual.filter((tx) => tx.needWant !== null).length
	};
}
function topTransactions(transactions, limit = 10) {
	return transactions.filter(isActual).slice().sort((a, b) => b.amountPaise - a.amountPaise || b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}
function monthlySeries(transactions) {
	const map = /* @__PURE__ */ new Map();
	for (const tx of transactions) {
		if (!isActual(tx) || tx.date.kind !== "full") continue;
		const key = tx.date.iso.slice(0, 7);
		map.set(key, (map.get(key) ?? 0) + tx.amountPaise);
	}
	return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([monthKey, paise]) => ({
		monthKey,
		paise
	}));
}
function dailySeries(transactions, monthKey) {
	const [year, month] = monthKey.split("-").map(Number);
	const days = new Date(year, month, 0).getDate();
	const totals = Array.from({ length: days }, () => 0);
	for (const tx of transactions) {
		if (!isActual(tx) || tx.date.kind !== "full" || tx.date.iso.slice(0, 7) !== monthKey) continue;
		const day = Number(tx.date.iso.slice(8, 10));
		totals[day - 1] += tx.amountPaise;
	}
	return totals.map((paise, index) => ({
		day: String(index + 1),
		paise
	}));
}
function countingNote(tx) {
	if (tx.refundable) return "Refundable deposit. It counts in cash outflow and deposits, not in living expenses or monthly spending.";
	if (tx.date.kind !== "full") return "Counted in overall expenses. It stays out of monthly totals and date charts until the date is complete.";
	return "Counted in living expenses for the month of this date.";
}
function describeDate(tx) {
	if (tx.date.kind === "full") {
		const [year, month, day] = tx.date.iso.split("-").map(Number);
		return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
			day: "numeric",
			month: "short",
			year: "numeric"
		});
	}
	if (tx.date.kind === "day-only") return `${ordinalDay(tx.date.day)} · month not set`;
	return "Date not set";
}
function ordinalDay(day) {
	const mod100 = day % 100;
	const mod10 = day % 10;
	return `${day}${mod100 >= 11 && mod100 <= 13 ? "th" : mod10 === 1 ? "st" : mod10 === 2 ? "nd" : mod10 === 3 ? "rd" : "th"}`;
}
function needsFullDate(tx) {
	return tx.date.kind !== "full";
}
function previewMonthAssign(transactions, monthKey) {
	let eligible = 0;
	let skipped = 0;
	for (const tx of transactions) {
		if (tx.date.kind !== "day-only") continue;
		if (composeISO(monthKey, tx.date.day)) eligible += 1;
		else skipped += 1;
	}
	return {
		eligible,
		skipped
	};
}
function assignMonthToDayOnly(transactions, monthKey, nowIso) {
	let updated = 0;
	let skipped = 0;
	return {
		transactions: transactions.map((tx) => {
			if (tx.date.kind !== "day-only") return tx;
			const iso = composeISO(monthKey, tx.date.day);
			if (!iso) {
				skipped += 1;
				return tx;
			}
			updated += 1;
			return {
				...tx,
				date: {
					kind: "full",
					iso
				},
				updatedAt: nowIso
			};
		}),
		updated,
		skipped
	};
}
function sortTransactions(transactions, sort) {
	const copy = transactions.slice();
	const time = (tx) => {
		if (tx.date.kind === "full") {
			const [year, month, day] = tx.date.iso.split("-").map(Number);
			return new Date(year, month - 1, day, 12).getTime();
		}
		return Date.parse(tx.createdAt);
	};
	copy.sort((a, b) => {
		if (sort === "highest") return b.amountPaise - a.amountPaise || time(b) - time(a);
		if (sort === "lowest") return a.amountPaise - b.amountPaise || time(b) - time(a);
		const delta = time(b) - time(a);
		return sort === "newest" ? delta : -delta;
	});
	return copy;
}
function unbudgetedCategories(transactions, budgets) {
	const planned = budgetedCategories(budgets);
	const found = /* @__PURE__ */ new Set();
	for (const tx of transactions) {
		if (!isActual(tx) || planned.has(tx.category)) continue;
		found.add(tx.category);
	}
	return [...found].sort((a, b) => a.localeCompare(b));
}
function previousMonthKey(monthKey) {
	const [year, month] = monthKey.split("-").map(Number);
	const date = new Date(year, month - 2, 1);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
var MAX_PAISE = 1e10;
function formatINR(paise) {
	const rounded = Math.round(paise);
	const sign = rounded < 0 ? "-" : "";
	const abs = Math.abs(rounded);
	const rupees = Math.floor(abs / 100);
	const frac = abs % 100;
	return `${sign}₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rupees)}.${String(frac).padStart(2, "0")}`;
}
function formatAxis(paise) {
	const rupees = Math.round(paise / 100);
	return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rupees)}`;
}
function paiseToInput(paise) {
	const abs = Math.abs(Math.round(paise));
	const rupees = Math.floor(abs / 100);
	const frac = abs % 100;
	if (frac === 0) return String(rupees);
	return `${rupees}.${String(frac).padStart(2, "0")}`;
}
function parseRupeesToPaise(raw, allowZero = false) {
	const cleaned = raw.replace(/[₹,\s]/g, "").trim();
	if (!cleaned) return null;
	if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
	const [whole, frac = ""] = cleaned.split(".");
	const paise = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
	if (!Number.isSafeInteger(paise) || paise > MAX_PAISE) return null;
	if (paise < 0) return null;
	if (paise === 0 && !allowZero) return null;
	return paise;
}
function formatPercent(percent) {
	if (!Number.isFinite(percent)) return "0%";
	return `${Math.max(0, Math.round(percent))}%`;
}
var unknown = { kind: "unknown" };
var day = (value) => ({
	kind: "day-only",
	day: value
});
var ROWS = [
	{
		item: "House advance — refundable",
		paise: 1667e3,
		category: "Advance Deposit",
		date: unknown,
		refundable: true
	},
	{
		item: "Oom Mart",
		paise: 6283,
		category: "Groceries",
		date: unknown
	},
	{
		item: "Egg",
		paise: 3417,
		category: "Food",
		date: unknown
	},
	{
		item: "Charger wire",
		paise: 10200,
		category: "Electronics",
		date: unknown
	},
	{
		item: "Mess food",
		paise: 2e5,
		category: "Mess Food",
		date: unknown
	},
	{
		item: "Duplicate gate key",
		paise: 2667,
		category: "Household Items",
		date: unknown
	},
	{
		item: "Wire",
		paise: 1400,
		category: "Household Items",
		date: unknown
	},
	{
		item: "Chicken puff",
		paise: 2700,
		category: "Snacks",
		date: day(17)
	},
	{
		item: "Revaluation fee",
		paise: 6e4,
		category: "College Fees",
		date: day(17)
	},
	{
		item: "Yogurt drink",
		paise: 3e3,
		category: "Drinks",
		date: day(17)
	},
	{
		item: "Fruit mixer",
		paise: 2500,
		category: "Drinks",
		date: day(17)
	},
	{
		item: "Water can",
		paise: 6e3,
		category: "Water",
		date: day(17)
	},
	{
		item: "Dinner",
		paise: 7500,
		category: "Dinner",
		date: day(18)
	},
	{
		item: "Tea",
		paise: 2700,
		category: "Tea and Coffee",
		date: day(20)
	},
	{
		item: "Biscuit",
		paise: 1e3,
		category: "Snacks",
		date: day(20)
	},
	{
		item: "Juice",
		paise: 3e3,
		category: "Drinks",
		date: day(20)
	},
	{
		item: "Sunday biryani",
		paise: 14e3,
		category: "Dinner",
		date: day(21)
	},
	{
		item: "Kalan",
		paise: 3e3,
		category: "Snacks",
		date: day(19),
		notes: "Date written separately; verify"
	},
	{
		item: "Slippers",
		paise: 51e3,
		category: "Footwear",
		date: day(21)
	},
	{
		item: "Yippee noodles for dinner",
		paise: 4300,
		category: "Dinner",
		date: day(21)
	},
	{
		item: "Yogurt",
		paise: 3e3,
		category: "Food",
		date: day(21)
	},
	{
		item: "Dosa",
		paise: 4e3,
		category: "Breakfast",
		date: day(22)
	},
	{
		item: "Notes",
		paise: 9e3,
		category: "Stationery",
		date: day(22)
	},
	{
		item: "Tea",
		paise: 1500,
		category: "Tea and Coffee",
		date: day(22)
	},
	{
		item: "Dosa",
		paise: 2e3,
		category: "Breakfast",
		date: day(22)
	},
	{
		item: "Kalan",
		paise: 3500,
		category: "Snacks",
		date: day(22)
	},
	{
		item: "Fruit mixer",
		paise: 2500,
		category: "Drinks",
		date: day(22)
	},
	{
		item: "Bread",
		paise: 1067,
		category: "Food",
		date: day(22)
	},
	{
		item: "Lunch rice",
		paise: 6500,
		category: "Lunch",
		date: day(23)
	},
	{
		item: "Dinner",
		paise: 6e3,
		category: "Dinner",
		date: day(23)
	},
	{
		item: "Breakfast idly",
		paise: 4e3,
		category: "Breakfast",
		date: day(24)
	},
	{
		item: "Fruit mixer",
		paise: 2500,
		category: "Drinks",
		date: day(24)
	},
	{
		item: "Egg puff",
		paise: 5e3,
		category: "Snacks",
		date: day(25)
	},
	{
		item: "Coffee",
		paise: 3e3,
		category: "Tea and Coffee",
		date: day(25)
	},
	{
		item: "Evening tea",
		paise: 1200,
		category: "Tea and Coffee",
		date: day(25)
	}
];
var SEED_BASE = Date.parse("2026-09-01T00:00:00.000Z");
var SEED_TRANSACTIONS = ROWS.map((row, index) => {
	const createdAt = new Date(SEED_BASE + index * 1e3).toISOString();
	return {
		id: `seed-${String(index + 1).padStart(2, "0")}`,
		item: row.item,
		amountPaise: row.paise,
		category: row.category,
		paymentMethod: null,
		needWant: null,
		refundable: row.refundable ?? false,
		notes: row.notes ?? "",
		date: row.date,
		createdAt,
		updatedAt: createdAt
	};
});
var SEED_MEAL_NOTES = [
	{
		id: "note-lunch-cut",
		text: "Only me lunch cut"
	},
	{
		id: "note-dinner-cut",
		text: "Dinner cut"
	},
	{
		id: "note-both-cut",
		text: "Lunch and dinner cut"
	}
];
var memory = /* @__PURE__ */ new Map();
var safeLocalStorage = {
	getItem: (key) => {
		try {
			return localStorage.getItem(key);
		} catch {
			return memory.get(key) ?? null;
		}
	},
	setItem: (key, value) => {
		try {
			localStorage.setItem(key, value);
		} catch {
			memory.set(key, value);
		}
	},
	removeItem: (key) => {
		try {
			localStorage.removeItem(key);
		} catch {
			memory.delete(key);
		}
	}
};
function assertDraft(draft) {
	if (!draft.item.trim()) throw new Error("Item name is required.");
	if (!Number.isSafeInteger(draft.amountPaise) || draft.amountPaise <= 0) throw new Error("Amount must be greater than zero.");
	if (!draft.category.trim()) throw new Error("Category is required.");
	if (draft.date.kind === "full" && !/^\d{4}-\d{2}-\d{2}$/.test(draft.date.iso)) throw new Error("Date is invalid.");
	if (draft.date.kind === "day-only" && (draft.date.day < 1 || draft.date.day > 31)) throw new Error("Day is invalid.");
}
function remember(prefs, category, payment) {
	return {
		recentCategories: [category, ...prefs.recentCategories.filter((item) => item !== category)].slice(0, 6),
		lastPayment: payment
	};
}
function mergeBudgets(saved) {
	const amounts = new Map((saved ?? []).map((line) => [line.id, line.plannedPaise]));
	return DEFAULT_BUDGETS.map((line) => {
		const planned = amounts.get(line.id);
		if (!Number.isSafeInteger(planned) || planned === void 0 || planned < 0) return line;
		return {
			...line,
			plannedPaise: planned
		};
	});
}
function readPersisted(value) {
	if (!value || typeof value !== "object") return {};
	const raw = value;
	const transactions = Array.isArray(raw.transactions) ? raw.transactions.filter(isTransaction) : void 0;
	const mealNotes = Array.isArray(raw.mealNotes) ? raw.mealNotes.filter((note) => !!note && typeof note === "object" && typeof note.id === "string" && typeof note.text === "string" && note.text.trim().length > 0) : void 0;
	return {
		transactions,
		budgets: Array.isArray(raw.budgets) ? raw.budgets : void 0,
		mealNotes,
		dailyLimitPaise: raw.dailyLimitPaise === null || Number.isSafeInteger(raw.dailyLimitPaise) && (raw.dailyLimitPaise ?? 0) > 0 ? raw.dailyLimitPaise ?? null : null,
		viewMonth: typeof raw.viewMonth === "string" && /^\d{4}-\d{2}$/.test(raw.viewMonth) ? raw.viewMonth : void 0,
		prefs: raw.prefs ? {
			recentCategories: Array.isArray(raw.prefs.recentCategories) ? raw.prefs.recentCategories.filter((item) => typeof item === "string").slice(0, 8) : [],
			lastPayment: isPaymentMethod(raw.prefs.lastPayment) ? raw.prefs.lastPayment : null
		} : void 0
	};
}
var useSpend = create()(persist((set, get) => ({
	transactions: SEED_TRANSACTIONS,
	budgets: DEFAULT_BUDGETS,
	mealNotes: SEED_MEAL_NOTES,
	dailyLimitPaise: null,
	viewMonth: currentMonthKey(),
	prefs: DEFAULT_PREFS,
	addTransaction: (draft) => {
		assertDraft(draft);
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const id = crypto.randomUUID();
		const tx = {
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
			updatedAt: now
		};
		set((state) => ({
			transactions: [tx, ...state.transactions],
			prefs: remember(state.prefs, tx.category, tx.paymentMethod)
		}));
		return id;
	},
	updateTransaction: (id, draft) => {
		assertDraft(draft);
		const now = (/* @__PURE__ */ new Date()).toISOString();
		set((state) => ({
			transactions: state.transactions.map((tx) => tx.id === id ? {
				...tx,
				item: draft.item.trim(),
				amountPaise: draft.amountPaise,
				category: draft.category.trim(),
				paymentMethod: draft.paymentMethod,
				needWant: draft.needWant,
				refundable: draft.refundable,
				notes: draft.notes.trim(),
				date: draft.date,
				updatedAt: now
			} : tx),
			prefs: remember(state.prefs, draft.category.trim(), draft.paymentMethod)
		}));
	},
	deleteTransaction: (id) => {
		set((state) => ({ transactions: state.transactions.filter((tx) => tx.id !== id) }));
	},
	setBudget: (id, plannedPaise) => {
		if (!Number.isSafeInteger(plannedPaise) || plannedPaise < 0) return;
		set((state) => ({ budgets: state.budgets.map((line) => line.id === id ? {
			...line,
			plannedPaise
		} : line) }));
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
		const result = assignMonthToDayOnly(get().transactions, monthKey, (/* @__PURE__ */ new Date()).toISOString());
		set({ transactions: result.transactions });
		return {
			updated: result.updated,
			skipped: result.skipped
		};
	},
	replaceAll: (data) => {
		set({
			transactions: data.transactions,
			budgets: mergeBudgets(data.budgets),
			mealNotes: data.mealNotes,
			dailyLimitPaise: data.dailyLimitPaise,
			viewMonth: data.viewMonth || currentMonthKey(),
			prefs: data.prefs
		});
	}
}), {
	name: "spendwise-student-v1",
	storage: createJSONStorage(() => safeLocalStorage),
	version: 1,
	partialize: (state) => ({
		transactions: state.transactions,
		budgets: state.budgets,
		mealNotes: state.mealNotes,
		dailyLimitPaise: state.dailyLimitPaise,
		viewMonth: state.viewMonth,
		prefs: state.prefs
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
			prefs: saved.prefs ?? current.prefs
		};
	}
}));
function Button({ variant = "primary", className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("press inline-flex h-12 items-center justify-center rounded-md px-4 text-base font-medium", variant === "primary" && "bg-teal text-paper", variant === "secondary" && "border border-line bg-card text-ink", variant === "ghost" && "bg-transparent text-ink", variant === "danger" && "bg-bad text-paper", className)
	});
}
var TextField = (0, import_react.forwardRef)(function TextField({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		...props,
		className: cn("h-12 w-full rounded-md border border-line bg-card px-3 text-base text-ink", className)
	});
});
function TextArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: cn("min-h-24 w-full rounded-md border border-line bg-card px-3 py-3 text-base text-ink", className)
	});
}
function SelectField({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: cn("h-12 w-full rounded-md border border-line bg-card px-3 text-base text-ink", className)
	});
}
function Field({ label, children, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-2 block text-sm font-medium text-muted",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-2 block text-sm text-muted",
				children: hint
			}) : null
		]
	});
}
function Card({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-3xl border border-line bg-card p-4 shadow-card", className),
		children
	});
}
function ScreenHeader({ title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "px-4 pt-6 pb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl tracking-tight text-ink",
			children: title
		}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: subtitle
		}) : null]
	});
}
function MonthSwitcher() {
	const viewMonth = useSpend((state) => state.viewMonth);
	const setViewMonth = useSpend((state) => state.setViewMonth);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-2xl border border-line bg-card px-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Previous month",
				className: "press grid size-11 place-items-center rounded-md text-ink",
				onClick: () => setViewMonth(shiftMonth(viewMonth, -1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-5",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-ink",
				children: monthLabel(viewMonth)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Next month",
				className: "press grid size-11 place-items-center rounded-md text-ink",
				onClick: () => setViewMonth(shiftMonth(viewMonth, 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
					className: "size-5",
					strokeWidth: 1.75
				})
			})
		]
	});
}
function Meter({ percent }) {
	const tone = percent > 90 ? "bad" : percent >= 70 ? "warn" : "good";
	const width = Math.max(0, Math.min(100, percent));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-2 overflow-hidden rounded-full bg-line",
		role: "progressbar",
		"aria-valuenow": Math.max(0, percent),
		"aria-valuemin": 0,
		"aria-valuemax": 100,
		"aria-label": "Budget used",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full rounded-full", tone === "good" && "bg-good", tone === "warn" && "bg-warn", tone === "bad" && "bg-bad"),
			style: { width: `${width}%` }
		})
	});
}
function TxButton({ tx, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "press flex min-h-14 w-full items-center gap-3 py-2 text-left",
		"aria-label": `Open ${tx.item}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate font-medium text-ink",
				children: tx.item
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block truncate text-sm text-muted",
				children: [
					tx.category,
					" · ",
					describeDate(tx),
					tx.refundable ? " · Refundable" : ""
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 font-medium text-ink tabular-nums",
			children: formatINR(tx.amountPaise)
		})]
	});
}
function Money({ paise, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("tabular-nums", className),
		children: formatINR(paise)
	});
}
function buildInsights(transactions, budgets, monthKey, dailyLimitPaise, now = /* @__PURE__ */ new Date()) {
	const insights = [];
	const month = monthStats(transactions, monthKey, now);
	const actual = transactions.filter((tx) => !tx.refundable);
	const overallCategories = groupCategories(actual);
	for (const line of budgets) {
		const spent = spentForCategories(transactions, line.categories, { monthKey });
		if (line.plannedPaise > 0 && spent > line.plannedPaise) insights.push({
			id: `over-${line.id}`,
			tone: "warn",
			title: `${line.label} is over the plan`,
			body: `${formatINR(spent)} dated to ${monthLabel(monthKey)} against ${formatINR(line.plannedPaise)} planned. Pause that category for the rest of the month.`
		});
	}
	const previousKey = previousMonthKey(monthKey);
	const previous = monthStats(transactions, previousKey, now);
	const elapsed = elapsedDays(monthKey, now);
	const previousElapsed = elapsedDays(previousKey, now);
	if (month.spendingPaise > 0 && previous.spendingPaise > 0 && elapsed > 0 && previousElapsed > 0) {
		const pace = month.spendingPaise / elapsed;
		const lastPace = previous.spendingPaise / previousElapsed;
		if (pace > lastPace * 1.15 && pace - lastPace >= 2e3) insights.push({
			id: "pace-up",
			tone: "warn",
			title: "This month is running hotter",
			body: `About ${formatINR(Math.round(pace))} a day so far, versus ${formatINR(Math.round(lastPace))} a day in ${monthLabel(previousKey)}.`
		});
	}
	const pricey = actual.filter((tx) => MEAL_CATEGORIES.has(tx.category)).slice().sort((a, b) => b.amountPaise - a.amountPaise)[0];
	if (pricey && pricey.amountPaise >= 1e4) insights.push({
		id: "pricey-meal",
		tone: "info",
		title: "One meal is doing a lot of damage",
		body: `${pricey.item} was ${formatINR(pricey.amountPaise)}. A simpler plate on days like that is the easiest cut.`
	});
	const snackPaise = actual.filter((tx) => SNACKISH_CATEGORIES.has(tx.category)).reduce((sum, tx) => sum + tx.amountPaise, 0);
	const snackCount = actual.filter((tx) => SNACKISH_CATEGORIES.has(tx.category)).length;
	const dailyFood = actual.filter((tx) => DAILY_FOOD_CATEGORIES.includes(tx.category)).reduce((sum, tx) => sum + tx.amountPaise, 0);
	if (snackCount >= 3 && dailyFood > 0 && snackPaise / dailyFood >= .25) insights.push({
		id: "snacks",
		tone: "warn",
		title: "Snacks, tea, and drinks add up",
		body: `${formatINR(snackPaise)} across ${snackCount} small buys — ${Math.round(snackPaise / dailyFood * 100)}% of breakfast, meals, snacks, and drinks outside the fixed mess bill. Skip one extra a day.`
	});
	const repeats = repeatedSmallBuys(actual).slice(0, 3);
	if (repeats.length > 0) insights.push({
		id: "repeats",
		tone: "info",
		title: "Same small buys keep returning",
		body: repeats.map((repeat) => describeRepeat(repeat)).join(" ")
	});
	const top = overallCategories[0];
	const actualTotal = actual.reduce((sum, tx) => sum + tx.amountPaise, 0);
	if (top && actualTotal > 0 && top.paise / actualTotal >= .25) insights.push({
		id: "top-category",
		tone: "info",
		title: `${top.category} is the largest share`,
		body: `${formatINR(top.paise)} of ${formatINR(actualTotal)} recorded living expenses. Everything else is smaller than this.`
	});
	if (dailyLimitPaise && dailyLimitPaise > 0 && monthKey === currentMonthKey(now)) {
		if (month.todayPaise > dailyLimitPaise) insights.push({
			id: "daily-over",
			tone: "warn",
			title: "Today is over your daily cap",
			body: `${formatINR(month.todayPaise)} spent today. The cap is ${formatINR(dailyLimitPaise)}.`
		});
	}
	const needWant = splitNeedWant(actual);
	if (needWant.labeledCount >= 3 && needWant.want > needWant.need && needWant.want > 0) insights.push({
		id: "wants",
		tone: "warn",
		title: "Wants are ahead of needs",
		body: `${formatINR(needWant.want)} marked as wants, ${formatINR(needWant.need)} as needs. The next snack or extra meal is the one to skip.`
	});
	if (monthKey === currentMonthKey(now) && daysLeftInMonth(monthKey, now) > 0 && month.spendingPaise === 0) {
		if (!actual.some((tx) => tx.date.kind === "full") && actual.length > 0) insights.push({
			id: "no-month",
			tone: "info",
			title: "This month's plan is still untouched",
			body: "Recorded history has no complete dates, so it is not counted against this month. New spending you add today will."
		});
	}
	return insights.slice(0, 4);
}
function describeRepeat(repeat) {
	const noun = repeat.count === 1 ? "time" : "times";
	return `${repeat.item} shows up ${repeat.count} ${noun} (${formatINR(repeat.paise)}).`;
}
function blankForm(category, payment) {
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
		day: String((/* @__PURE__ */ new Date()).getDate())
	};
}
function fromTransaction(id) {
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
		day: tx.date.kind === "day-only" ? String(tx.date.day) : String((/* @__PURE__ */ new Date()).getDate())
	};
}
function AddScreen({ active, editingId, onSavedEdit }) {
	const prefs = useSpend((state) => state.prefs);
	const addTransaction = useSpend((state) => state.addTransaction);
	const updateTransaction = useSpend((state) => state.updateTransaction);
	const itemRef = (0, import_react.useRef)(null);
	const [form, setForm] = (0, import_react.useState)(() => blankForm("", null));
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const prefsNow = useSpend.getState().prefs;
		if (editingId) setForm(fromTransaction(editingId) ?? blankForm(prefsNow.recentCategories[0] ?? "", prefsNow.lastPayment));
		else setForm(blankForm(prefsNow.recentCategories[0] ?? "", prefsNow.lastPayment));
		setError(null);
	}, [editingId]);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		window.scrollTo(0, 0);
		const timer = window.setTimeout(() => itemRef.current?.focus(), 60);
		return () => window.clearTimeout(timer);
	}, [active, editingId]);
	const amountPaise = parseRupeesToPaise(form.amount);
	const amountHint = form.amount.trim() && amountPaise === null ? "Use a number above zero, like 40 or 62.83. Negatives are not saved." : null;
	const ordered = [...prefs.recentCategories.filter((category) => isKnownCategory(category) || category === form.category), ...CATEGORIES.filter((category) => !prefs.recentCategories.includes(category))];
	if (form.category && !ordered.includes(form.category)) ordered.unshift(form.category);
	function patch(partial) {
		setForm((current) => ({
			...current,
			...partial
		}));
		setError(null);
	}
	function buildDraft() {
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
		let date;
		if (form.dateMode === "unknown") date = { kind: "unknown" };
		else if (form.dateMode === "day-only") {
			const day = Number(form.day);
			if (!Number.isInteger(day) || day < 1 || day > 31) {
				setError("Day must be between 1 and 31. Leave the month blank rather than guessing it.");
				return null;
			}
			date = {
				kind: "day-only",
				day
			};
		} else {
			if (!isRealISODate(form.iso)) {
				setError("Choose a real date, or mark it unknown.");
				return null;
			}
			date = {
				kind: "full",
				iso: form.iso
			};
		}
		return {
			item: form.item.trim(),
			amountPaise,
			category: form.category,
			paymentMethod: form.payment,
			needWant: form.need,
			refundable: form.refundable,
			notes: form.notes.trim(),
			date
		};
	}
	function onSubmit(event) {
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
		} catch {}
		toast(`Saved ${draft.item}`);
		const nextPrefs = useSpend.getState().prefs;
		setForm(blankForm(nextPrefs.recentCategories[0] ?? draft.category, nextPrefs.lastPayment));
		window.scrollTo(0, 0);
		itemRef.current?.focus();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "pad-nav-form px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: editingId ? "Edit" : "Add",
				subtitle: editingId ? "Saving updates every total." : "Date, name, amount, category. That is enough."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-sm font-medium text-muted",
							children: "Date"
						}),
						form.dateMode === "full" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							type: "date",
							"aria-label": "Date",
							value: form.iso,
							onChange: (event) => patch({ iso: event.target.value })
						}) : null,
						form.dateMode === "day-only" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							inputMode: "numeric",
							value: form.day,
							"aria-label": "Day of month",
							onChange: (event) => patch({ day: event.target.value.replace(/\D/g, "").slice(0, 2) })
						}) : null,
						form.dateMode === "unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-ink",
							children: "No date will be stored."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [
								form.dateMode !== "full" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniToggle, {
									onClick: () => patch({ dateMode: "full" }),
									children: "Use a full date"
								}) : null,
								form.dateMode !== "day-only" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniToggle, {
									onClick: () => patch({ dateMode: "day-only" }),
									children: "Only the day"
								}) : null,
								form.dateMode !== "unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniToggle, {
									onClick: () => patch({ dateMode: "unknown" }),
									children: "Date unknown"
								}) : null
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Item",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							ref: itemRef,
							id: "expense-item",
							value: form.item,
							placeholder: "Tea, rent, slippers",
							maxLength: 80,
							autoComplete: "off",
							onChange: (event) => patch({ item: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Amount",
						hint: amountHint ?? void 0,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							id: "expense-amount",
							inputMode: "decimal",
							value: form.amount,
							placeholder: "0.00",
							className: "text-2xl font-medium tabular-nums",
							onChange: (event) => patch({ amount: event.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "mb-2 text-sm font-medium text-muted",
						children: "Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: ordered.map((category) => {
							const selected = form.category === category;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": selected,
								className: `press min-h-11 rounded-md border px-3 text-left text-sm font-medium ${selected ? "border-teal bg-teal-soft text-teal" : "border-line bg-card text-ink"}`,
								onClick: () => patch({ category }),
								children: category
							}, category);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "mb-2 text-sm font-medium text-muted",
							children: "Payment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: PAYMENT_OPTIONS.map((option) => {
								const selected = form.payment === option.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": selected,
									className: `press min-h-11 rounded-md border px-3 text-sm font-medium ${selected ? "border-teal bg-teal-soft text-teal" : "border-line bg-card text-ink"}`,
									onClick: () => patch({ payment: selected ? null : option.id }),
									children: option.label
								}, option.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Leave unselected if you do not remember. That is not the same as Not Specified."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "mb-2 text-sm font-medium text-muted",
						children: "Need or want"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: ["need", "want"].map((value) => {
							const selected = form.need === value;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": selected,
								className: `press min-h-12 rounded-md border text-sm font-medium ${selected ? "border-teal bg-teal-soft text-teal" : "border-line bg-card text-ink"}`,
								onClick: () => patch({ need: selected ? null : value }),
								children: value === "need" ? "Need" : "Want"
							}, value);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "switch",
						"aria-checked": form.refundable,
						className: "press flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 text-left",
						onClick: () => patch({ refundable: !form.refundable }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium text-ink",
							children: "Refundable deposit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm text-muted",
							children: "Counted in cash out, not in living expenses."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `h-7 w-12 shrink-0 rounded-full p-1 ${form.refundable ? "bg-teal" : "bg-line"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block size-5 rounded-full bg-card ${form.refundable ? "ml-auto" : ""}` })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							value: form.notes,
							maxLength: 280,
							placeholder: "Optional",
							onChange: (event) => patch({ notes: event.target.value })
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-sm font-medium text-bad",
						children: error
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "save-bar px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: editingId ? "Save changes" : form.category ? `Save · ${form.category}` : "Save expense"
					})
				})
			})
		]
	});
}
function MiniToggle({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "press h-11 rounded-md px-2 text-sm font-medium text-teal",
		onClick,
		children
	});
}
function BudgetScreen() {
	const budgets = useSpend((state) => state.budgets);
	const transactions = useSpend((state) => state.transactions);
	const viewMonth = useSpend((state) => state.viewMonth);
	const planned = budgetPlanned(budgets);
	const month = monthStats(transactions, viewMonth);
	const remaining = planned - month.spendingPaise;
	const percent = usedPercent(month.spendingPaise, planned);
	const tone = budgetTone(percent);
	const others = unbudgetedCategories(transactions, budgets);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: "Budget",
				subtitle: "Plans only. Editing these does not add expenses."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthSwitcher, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Planned for a month"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-3xl font-medium tracking-tight text-ink tabular-nums",
					children: formatINR(planned)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `mt-2 text-sm font-medium ${tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "text-good"}`,
					children: [
						formatINR(month.spendingPaise),
						" dated to ",
						monthLabel(viewMonth),
						" · ",
						remaining >= 0 ? `${formatINR(remaining)} left` : `${formatINR(Math.abs(remaining))} over`
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { percent })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [formatPercent(percent), " of the plan. Undated lines are not included."]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: budgets.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetRow, {
					line,
					monthKey: viewMonth
				}, line.id))
			}),
			others.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: "No monthly plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Still tracked. They are not part of the ₹ plan above."
					}),
					others.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtherRow, {
						category,
						monthKey: viewMonth
					}, category))
				]
			}) : null
		]
	});
}
function BudgetRow({ line, monthKey }) {
	const transactions = useSpend((state) => state.transactions);
	const setBudget = useSpend((state) => state.setBudget);
	const [text, setText] = (0, import_react.useState)(paiseToInput(line.plannedPaise));
	const [invalid, setInvalid] = (0, import_react.useState)(false);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-ink",
			children: line.label
		}),
		line.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: line.hint
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-3 block text-sm text-muted",
			children: ["Planned amount", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				inputMode: "decimal",
				"aria-label": `Planned amount for ${line.label}`,
				value: text,
				onChange: (event) => {
					setText(event.target.value);
					setInvalid(false);
				},
				onBlur: () => commit(),
				onKeyDown: (event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						commit();
					}
				},
				className: "mt-2 h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink tabular-nums"
			})]
		}),
		invalid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-bad",
			children: "Enter zero or a positive amount."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-3 space-y-1 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Spent this month",
					value: formatINR(monthSpent)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: left >= 0 ? "Remaining" : "Over",
					value: formatINR(Math.abs(left))
				}),
				waiting > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Waiting on a date",
					value: formatINR(waiting)
				}) : null,
				elsewhere > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Other months",
					value: formatINR(elsewhere)
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { percent })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-muted",
			children: [formatPercent(percent), " of this line, this month only."]
		})
	] }) });
}
function OtherRow({ category, monthKey }) {
	const transactions = useSpend((state) => state.transactions);
	const monthSpent = spentForCategories(transactions, [category], { monthKey });
	const waiting = spentForCategories(transactions, [category], { waiting: true });
	const elsewhere = spentForCategories(transactions, [category], { otherThan: monthKey });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-medium text-ink",
		children: category
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "mt-2 space-y-1 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
				label: "This month",
				value: formatINR(monthSpent)
			}),
			waiting > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
				label: "Waiting on a date",
				value: formatINR(waiting)
			}) : null,
			elsewhere > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
				label: "Other months",
				value: formatINR(elsewhere)
			}) : null
		]
	})] });
}
function Info({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-medium text-ink tabular-nums",
			children: value
		})]
	});
}
function DetailSheet({ id, onClose, onEdit }) {
	const tx = useSpend((state) => state.transactions.find((item) => item.id === id));
	const remove = useSpend((state) => state.deleteTransaction);
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	if (!tx) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/40",
		role: "presentation",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "tx-detail-title",
			className: "max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-muted",
						children: "Transaction"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close details",
						className: "press grid size-11 place-items-center",
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-5",
							strokeWidth: 1.75
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "tx-detail-title",
					className: "font-display text-3xl tracking-tight text-ink",
					children: tx.item
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-2xl font-medium text-ink tabular-nums",
					children: formatINR(tx.amountPaise)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Category",
							value: tx.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Date",
							value: describeDate(tx)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Payment",
							value: paymentLabel(tx.paymentMethod)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Need or want",
							value: needLabel(tx.needWant)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Refundable deposit",
							value: tx.refundable ? "Yes" : "No"
						}),
						tx.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Notes",
							value: tx.notes
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: countingNote(tx)
				}),
				confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 rounded-2xl bg-bad-soft p-4 text-ink",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-bad",
							children: "Delete this expense?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: "Totals, budgets, and charts will update. This cannot be undone."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setConfirming(false),
								children: "Keep"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "danger",
								onClick: () => {
									remove(tx.id);
									onClose();
								},
								children: "Delete"
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => onEdit(tx.id),
						children: "Edit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "danger",
						onClick: () => setConfirming(true),
						children: "Delete"
					})]
				})
			]
		})
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right font-medium text-ink",
			children: value
		})]
	});
}
function HistoryScreen({ preset, onPresetConsumed, onOpen }) {
	const transactions = useSpend((state) => state.transactions);
	const viewMonth = useSpend((state) => state.viewMonth);
	const assign = useSpend((state) => state.assignDayOnlyMonth);
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [dateScope, setDateScope] = (0, import_react.useState)("all");
	const [exactDate, setExactDate] = (0, import_react.useState)("");
	const [need, setNeed] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const [monthToApply, setMonthToApply] = (0, import_react.useState)("");
	const [confirmApply, setConfirmApply] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (preset !== "needs-date") return;
		setDateScope("needs-date");
		onPresetConsumed();
	}, [preset, onPresetConsumed]);
	const months = (0, import_react.useMemo)(() => {
		const keys = new Set(monthlySeries(transactions).map((row) => row.monthKey));
		keys.add(viewMonth);
		return [...keys].sort();
	}, [transactions, viewMonth]);
	const categories = (0, import_react.useMemo)(() => {
		const extra = transactions.map((tx) => tx.category).filter((name) => !CATEGORIES.includes(name));
		return [.../* @__PURE__ */ new Set([...CATEGORIES, ...extra])];
	}, [transactions]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return sortTransactions(transactions.filter((tx) => {
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
		}), sort);
	}, [
		transactions,
		query,
		category,
		need,
		exactDate,
		dateScope,
		sort
	]);
	const showingActual = sumPaise(filtered.filter((tx) => !tx.refundable));
	const showingDeposits = sumPaise(filtered.filter((tx) => tx.refundable));
	const dayOnlyCount = transactions.filter((tx) => tx.date.kind === "day-only").length;
	const unknownCount = transactions.filter((tx) => tx.date.kind === "unknown").length;
	const preview = monthToApply ? previewMonthAssign(transactions, monthToApply) : null;
	function applyMonth() {
		if (!monthToApply || !preview || preview.eligible === 0) return;
		const result = assign(monthToApply);
		setConfirmApply(false);
		toast(result.skipped > 0 ? `Dated ${result.updated}. ${result.skipped} day does not exist in that month.` : `Dated ${result.updated} entries to ${monthLabel(monthToApply)}.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: "Transactions",
				subtitle: "Search, fix a date, or open a line to edit it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted",
					strokeWidth: 1.75
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Search item name",
					"aria-label": "Search item name",
					className: "h-12 w-full rounded-md border border-line bg-card pr-3 pl-10 text-base"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
						"aria-label": "Category",
						value: category,
						onChange: (event) => setCategory(event.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All categories"
						}), categories.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: name,
							children: name
						}, name))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
						"aria-label": "Date filter",
						value: dateScope,
						onChange: (event) => setDateScope(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All dates"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "needs-date",
								children: "Needs a date"
							}),
							months.map((monthKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: `month:${monthKey}`,
								children: monthLabel(monthKey)
							}, monthKey))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
						"aria-label": "Need or want",
						value: need,
						onChange: (event) => setNeed(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "Need and want"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "need",
								children: "Need"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "want",
								children: "Want"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "unassigned",
								children: "Unassigned"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
						"aria-label": "Sort",
						value: sort,
						onChange: (event) => setSort(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "newest",
								children: "Newest"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "oldest",
								children: "Oldest"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "highest",
								children: "Highest amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "lowest",
								children: "Lowest amount"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm text-muted",
				children: ["Exact date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					value: exactDate,
					"aria-label": "Exact date",
					onChange: (event) => setExactDate(event.target.value),
					className: "mt-2 h-12 w-full rounded-md border border-line bg-card px-3 text-base text-ink"
				})]
			}),
			dayOnlyCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium text-ink",
					children: [dayOnlyCount, " entries have a day, but no month"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [unknownCount > 0 ? `${unknownCount} more have no day at all — open those one by one. ` : "", "Applying a month keeps each written day. It does not invent a month on its own."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-sm font-medium text-muted",
					children: ["Month and year", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "month",
						value: monthToApply,
						"aria-label": "Month to apply",
						onChange: (event) => {
							setMonthToApply(event.target.value);
							setConfirmApply(false);
						},
						className: "mt-2 h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink"
					})]
				}),
				confirmApply && preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-ink",
						children: [
							"Set ",
							preview.eligible,
							" entries to ",
							monthLabel(monthToApply),
							preview.skipped > 0 ? `. ${preview.skipped} will be skipped because that day is not in the month.` : "."
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setConfirmApply(false),
							children: "Back"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							onClick: applyMonth,
							disabled: preview.eligible === 0,
							children: "Confirm"
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					className: "mt-3 w-full",
					variant: "secondary",
					disabled: !monthToApply,
					onClick: () => setConfirmApply(true),
					children: "Apply to day-only entries"
				})
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					filtered.length,
					" of ",
					transactions.length,
					" · ",
					formatINR(showingActual),
					" expenses",
					showingDeposits > 0 ? ` · ${formatINR(showingDeposits)} deposits` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "py-1",
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-8 text-center text-sm text-muted",
					children: "Nothing matches these filters."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-line",
					children: filtered.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxButton, {
							tx,
							onClick: () => onOpen(tx.id)
						})
					}, tx.id))
				})
			})
		]
	});
}
function HomeScreen({ onOpen, onReviewDates }) {
	const transactions = useSpend((state) => state.transactions);
	const budgets = useSpend((state) => state.budgets);
	const viewMonth = useSpend((state) => state.viewMonth);
	const dailyLimit = useSpend((state) => state.dailyLimitPaise);
	const mealNotes = useSpend((state) => state.mealNotes);
	const deleteMealNote = useSpend((state) => state.deleteMealNote);
	const now = /* @__PURE__ */ new Date();
	const totals = overallTotals(transactions);
	const month = monthStats(transactions, viewMonth, now);
	const planned = budgetPlanned(budgets);
	const remaining = planned - month.spendingPaise;
	const percent = planned <= 0 ? month.spendingPaise > 0 ? 100 : 0 : Math.round(month.spendingPaise / planned * 100);
	const tone = budgetTone(percent);
	const undated = transactions.filter(needsFullDate).length;
	const recent = transactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
	const insights = buildInsights(transactions, budgets, viewMonth, dailyLimit, now).slice(0, 2);
	const status = statusCopy(percent, remaining, month.spendingPaise, undated, monthLabel(viewMonth));
	const daysLeft = daysLeftInMonth(viewMonth, now);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-4 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "flex items-end justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl tracking-tight text-ink",
					children: "SpendWise"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Student ledger"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthSwitcher, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-muted",
					children: "Recorded expenses"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-4xl font-medium tracking-tight text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { paise: totals.actualPaise })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Living costs only. The refundable advance is not in this number."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							label: "Cash outflow",
							value: formatINR(totals.outflowPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							label: "Refundable deposits",
							value: formatINR(totals.refundablePaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							label: "Entries",
							value: String(totals.count)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							label: "Largest expense",
							value: totals.largest ? `${totals.largest.item} · ${formatINR(totals.largest.amountPaise)}` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							label: "Highest category",
							value: totals.topCategory ? `${totals.topCategory.category} · ${formatINR(totals.topCategory.paise)}` : "—"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-muted",
							children: monthLabel(viewMonth)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-1 text-3xl font-medium tracking-tight ${tone === "bad" ? "text-bad" : "text-ink"}`,
							children: remaining >= 0 ? formatINR(remaining) : formatINR(Math.abs(remaining))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: remaining >= 0 ? "left in the plan" : "over the plan"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `rounded-md px-2 py-1 text-sm font-medium ${toneClass(tone)}`,
						children: formatPercent(percent)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { percent })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `mt-3 text-sm font-medium ${tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-bad"}`,
					children: status.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: status.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 grid grid-cols-2 gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "This month",
							value: formatINR(month.spendingPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "Today",
							value: formatINR(month.todayPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "Average / day",
							value: formatINR(month.averageDailyPaise)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "Days left",
							value: daysLeft > 0 ? String(daysLeft) : "Closed"
						})
					]
				}),
				dailyLimit && viewMonth === currentMonthKey(now) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-ink",
					children: [
						"Daily cap ",
						formatINR(dailyLimit),
						".",
						" ",
						month.todayPaise > dailyLimit ? `${formatINR(month.todayPaise - dailyLimit)} over today.` : `${formatINR(dailyLimit - month.todayPaise)} left today.`
					]
				}) : null
			] }),
			insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: `rounded-2xl px-4 py-3 ${insightSkin(insight.tone)}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: insight.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm",
					children: insight.body
				})]
			}, insight.id)),
			undated > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onReviewDates,
				className: "press w-full rounded-2xl border border-line bg-card px-4 py-3 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium text-ink",
					children: [undated, " entries still need a complete date"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"They count in the recorded total, not in ",
						monthLabel(viewMonth),
						". Tap to fix them. No month is guessed."
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-sm font-medium text-muted",
				children: "Recent"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "py-1",
				children: recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-center text-sm text-muted",
					children: "No expenses yet. Add the first one from the plus button."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-line",
					children: recent.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxButton, {
							tx,
							onClick: () => onOpen(tx.id)
						})
					}, tx.id))
				})
			})] }),
			mealNotes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-muted",
					children: "Meal notes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-2 text-sm text-muted",
					children: "Not expenses. No amounts, so they never enter a total."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: mealNotes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MealRow, {
						text: note.text,
						onRemove: () => deleteMealNote(note.id)
					}, note.id))
				})
			] }) : null
		]
	});
}
function MealRow({ text, onRemove }) {
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-ink",
			children: text
		}), confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex shrink-0 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "press h-11 text-sm font-medium text-muted",
				onClick: () => setConfirming(false),
				children: "Keep"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "press h-11 text-sm font-medium text-bad",
				onClick: onRemove,
				children: "Remove"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "press h-11 shrink-0 text-sm font-medium text-muted",
			onClick: () => setConfirming(true),
			children: "Remove"
		})]
	});
}
function Line({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right font-medium text-ink",
			children: value
		})]
	});
}
function Mini({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-paper px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-ink tabular-nums",
			children: value
		})]
	});
}
function toneClass(tone) {
	if (tone === "warn") return "bg-warn-soft text-warn";
	if (tone === "bad") return "bg-bad-soft text-bad";
	return "bg-good-soft text-good";
}
function insightSkin(tone) {
	if (tone === "warn") return "bg-warn-soft text-ink";
	if (tone === "good") return "bg-good-soft text-ink";
	return "bg-teal-soft text-ink";
}
function statusCopy(percent, remaining, spent, undated, monthName) {
	if (spent === 0 && undated > 0) return {
		title: "Within the plan",
		body: `Nothing is dated to ${monthName} yet, so this month's spending is still zero. Older lines stay in the recorded total until you give them a month and year.`
	};
	if (percent > 100) return {
		title: "Over budget",
		body: `${monthName} is over the plan by ${formatINR(Math.abs(remaining))}. Hold snacks and extra meals for the rest of the month.`
	};
	if (percent > 90) return {
		title: "Almost at the limit",
		body: `${formatINR(remaining)} left in ${monthName}. Skip the next want.`
	};
	if (percent >= 70) return {
		title: "Getting close",
		body: `${formatINR(remaining)} left in ${monthName}. Ease off snacks and expensive dinners.`
	};
	return {
		title: "Within budget",
		body: `${formatINR(remaining)} left in ${monthName}.`
	};
}
var ReportsScreen = (0, import_react.lazy)(() => import("./reports-screen-D6fpZ9YV.mjs").then((mod) => ({ default: mod.ReportsScreen })));
function SpendApp() {
	const [tab, setTab] = (0, import_react.useState)("home");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [datePreset, setDatePreset] = (0, import_react.useState)(null);
	const clearPreset = (0, import_react.useCallback)(() => setDatePreset(null), []);
	function openAdd(id) {
		setEditingId(id);
		setTab("add");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto min-h-dvh w-full max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: tab === "add" ? "" : "pad-nav",
					children: [
						tab === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, {
							onOpen: setOpenId,
							onReviewDates: () => {
								setDatePreset("needs-date");
								setTab("history");
							}
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							hidden: tab !== "add",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddScreen, {
								active: tab === "add",
								editingId,
								onSavedEdit: () => setTab("history")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							hidden: tab !== "history",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryScreen, {
								preset: datePreset,
								onPresetConsumed: clearPreset,
								onOpen: setOpenId
							})
						}),
						tab === "budget" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetScreen, {}) : null,
						tab === "reports" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-4 pt-8 text-sm text-muted",
								children: "Opening reports…"
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsScreen, {})
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid h-16 max-w-md grid-cols-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
								label: "Home",
								active: tab === "home",
								onClick: () => setTab("home"),
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, {
									className: "size-5",
									strokeWidth: 1.75
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
								label: "Ledger",
								active: tab === "history",
								onClick: () => setTab("history"),
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
									className: "size-5",
									strokeWidth: 1.75
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "press flex flex-col items-center justify-end pb-1 text-xs font-medium text-muted",
								onClick: () => openAdd(null),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "-mt-6 grid size-12 place-items-center rounded-full bg-teal text-paper",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
										className: "size-6",
										strokeWidth: 1.75
									})
								}), "Add"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
								label: "Budget",
								active: tab === "budget",
								onClick: () => setTab("budget"),
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
									className: "size-5",
									strokeWidth: 1.75
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
								label: "Reports",
								active: tab === "reports",
								onClick: () => setTab("reports"),
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, {
									className: "size-5",
									strokeWidth: 1.75
								})
							})
						]
					})
				})]
			}),
			openId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSheet, {
				id: openId,
				onClose: () => setOpenId(null),
				onEdit: (id) => {
					setOpenId(null);
					openAdd(id);
				}
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				offset: 16,
				toastOptions: { style: {
					background: "var(--color-card)",
					color: "var(--color-ink)",
					border: "1px solid var(--color-line)"
				} }
			})
		]
	});
}
function NavButton({ label, active, onClick, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-current": active ? "page" : void 0,
		className: `press flex flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-teal" : "text-muted"}`,
		children: [icon, label]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	if (!useSpendReady()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpendApp, {});
}
function useSpendReady() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (useSpend.persist.hasHydrated()) {
			setReady(true);
			return;
		}
		return useSpend.persist.onFinishHydration(() => setReady(true));
	}, []);
	return ready;
}
function BootScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-paper px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl tracking-tight text-ink",
				children: "SpendWise"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Student ledger"
			})]
		})
	});
}
//#endregion
export { shortBudgetLabel as A, splitNeedWant as C, isPaymentMethod as D, DEFAULT_PREFS as E, shortMonthLabel as F, daysLeftInMonth as M, isRealISODate as N, isTransaction as O, monthLabel as P, splitFood as S, DEFAULT_BUDGETS as T, monthlySeries as _, MonthSwitcher as a, spentForCategories as b, formatAxis as c, parseRupeesToPaise as d, budgetPlanned as f, monthStats as g, groupCategories as h, Card as i, currentMonthKey as j, paymentLabel as k, formatINR as l, describeDate as m, buildInsights as n, ScreenHeader as o, dailySeries as p, Button as r, useSpend as s, routes_exports as t, paiseToInput as u, overallTotals as v, topTransactions as w, splitFixed as x, repeatedSmallBuys as y };
