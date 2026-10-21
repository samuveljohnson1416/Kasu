import { i as __toESM } from "../_runtime.mjs";
import { K as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as shortBudgetLabel, C as splitNeedWant, D as isPaymentMethod, E as DEFAULT_PREFS, F as shortMonthLabel, M as daysLeftInMonth, N as isRealISODate, O as isTransaction, P as monthLabel, S as splitFood, T as DEFAULT_BUDGETS, _ as monthlySeries, a as MonthSwitcher, b as spentForCategories, c as formatAxis, d as parseRupeesToPaise, f as budgetPlanned, g as monthStats, h as groupCategories, i as Card, j as currentMonthKey, k as paymentLabel, l as formatINR, m as describeDate, n as buildInsights, o as ScreenHeader, p as dailySeries, r as Button, s as useSpend, u as paiseToInput, v as overallTotals, w as topTransactions, x as splitFixed, y as repeatedSmallBuys } from "./routes-UfjMsReR.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as BarChart, o as Line, r as LineChart, s as CartesianGrid, t as PieChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-screen-D6fpZ9YV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function csvCell(value) {
	const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
	if (/[",\n\r]/.test(guarded)) return `"${guarded.replace(/"/g, "\"\"")}"`;
	return guarded;
}
function dateColumns(tx) {
	if (tx.date.kind === "full") return [
		"full",
		tx.date.iso,
		""
	];
	if (tx.date.kind === "day-only") return [
		"day-only",
		"",
		String(tx.date.day)
	];
	return [
		"unknown",
		"",
		""
	];
}
function toCsv(transactions) {
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
		"Notes"
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
			tx.notes
		].map(csvCell).join(",");
	});
	return `\uFEFF${[header.join(","), ...lines].join("\n")}\n`;
}
function toBackup(input) {
	return {
		version: 1,
		app: "SpendWise Student",
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		...input
	};
}
function isMealNote(value) {
	if (!value || typeof value !== "object") return false;
	const note = value;
	return typeof note.id === "string" && note.id.length > 0 && typeof note.text === "string" && note.text.trim().length > 0;
}
function mergeBudgets(value) {
	if (!Array.isArray(value)) return null;
	const saved = /* @__PURE__ */ new Map();
	for (const line of value) {
		if (!line || typeof line !== "object") return null;
		const id = line.id;
		const planned = line.plannedPaise;
		if (typeof id !== "string" || !Number.isSafeInteger(planned) || planned < 0) return null;
		saved.set(id, planned);
	}
	return DEFAULT_BUDGETS.map((line) => saved.has(line.id) ? {
		...line,
		plannedPaise: saved.get(line.id) ?? line.plannedPaise
	} : line);
}
function readPrefs(value) {
	if (!value || typeof value !== "object") return DEFAULT_PREFS;
	const prefs = value;
	return {
		recentCategories: Array.isArray(prefs.recentCategories) ? prefs.recentCategories.filter((item) => typeof item === "string").slice(0, 8) : [],
		lastPayment: isPaymentMethod(prefs.lastPayment) ? prefs.lastPayment : null
	};
}
function parseBackup(value) {
	if (!value || typeof value !== "object") return {
		ok: false,
		error: "That file is not a SpendWise backup."
	};
	const raw = value;
	if (raw.version !== 1) return {
		ok: false,
		error: "This backup version is not supported."
	};
	if (!Array.isArray(raw.transactions) || !raw.transactions.every(isTransaction)) return {
		ok: false,
		error: "The transaction list in that file is incomplete or invalid."
	};
	const budgets = mergeBudgets(raw.budgets);
	if (!budgets) return {
		ok: false,
		error: "The budget section in that file is invalid."
	};
	if (!Array.isArray(raw.mealNotes) || !raw.mealNotes.every(isMealNote)) return {
		ok: false,
		error: "The meal notes in that file are invalid."
	};
	let dailyLimitPaise = null;
	if (raw.dailyLimitPaise !== null && raw.dailyLimitPaise !== void 0) {
		if (!Number.isSafeInteger(raw.dailyLimitPaise) || raw.dailyLimitPaise < 0) return {
			ok: false,
			error: "The daily limit in that file is invalid."
		};
		dailyLimitPaise = raw.dailyLimitPaise === 0 ? null : raw.dailyLimitPaise;
	}
	const viewMonth = typeof raw.viewMonth === "string" && /^\d{4}-\d{2}$/.test(raw.viewMonth) && isRealISODate(`${raw.viewMonth}-01`) ? raw.viewMonth : "";
	return {
		ok: true,
		data: {
			version: 1,
			app: "SpendWise Student",
			exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
			transactions: raw.transactions,
			budgets,
			mealNotes: raw.mealNotes.map((note) => ({
				id: note.id,
				text: note.text.trim()
			})),
			dailyLimitPaise,
			viewMonth,
			prefs: readPrefs(raw.prefs)
		}
	};
}
function downloadText(filename, contents, type) {
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
function formatExportStamp(now = /* @__PURE__ */ new Date()) {
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function ReportsScreen() {
	const [tab, setTab] = (0, import_react.useState)("charts");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: "Reports",
				subtitle: "Ordinary spending. Refundable deposits stay in their own total."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthSwitcher, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1 rounded-2xl bg-line p-1",
				children: [
					["charts", "Charts"],
					["save", "Save"],
					["data", "Data"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `press h-11 rounded-xl text-sm font-medium ${tab === id ? "bg-card text-ink" : "text-muted"}`,
					onClick: () => setTab(id),
					children: label
				}, id))
			}),
			tab === "charts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Charts, {}) : null,
			tab === "save" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveMoney, {}) : null,
			tab === "data" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTools, {}) : null
		]
	});
}
function Charts() {
	const transactions = useSpend((state) => state.transactions);
	const budgets = useSpend((state) => state.budgets);
	const viewMonth = useSpend((state) => state.viewMonth);
	const [pieScope, setPieScope] = (0, import_react.useState)("all");
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
		actual: spentForCategories(transactions, line.categories, { monthKey: viewMonth })
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Cash outflow"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-3xl font-medium text-ink tabular-nums",
					children: formatINR(totals.outflowPaise)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-ink",
					children: [
						formatINR(totals.actualPaise),
						" living expenses + ",
						formatINR(totals.refundablePaise),
						" refundable deposits."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "The advance is in this total only. It is left out of the charts below."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium text-ink",
						children: "By category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex rounded-xl bg-paper p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScopeButton, {
							active: pieScope === "all",
							onClick: () => setPieScope("all"),
							children: "All"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScopeButton, {
							active: pieScope === "month",
							onClick: () => setPieScope("month"),
							children: "Month"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: pieScope === "all" ? "Every non-refundable entry, including ones without a full date." : `Only complete dates in ${monthLabel(viewMonth)}.`
				}),
				pieSource.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No ordinary spending in this view yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chart-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data: collapse(pieSource),
							dataKey: "paise",
							nameKey: "name",
							innerRadius: 58,
							outerRadius: 84,
							paddingAngle: 1.5,
							stroke: "none",
							children: collapse(pieSource).map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: `var(--color-chart-${index % 8 + 1})` }, row.name))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (value) => formatINR(Number(value ?? 0)) })] })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: pieSource.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex min-w-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 shrink-0 rounded-full",
								style: { background: `var(--color-chart-${index % 8 + 1})` }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-ink",
								children: row.category
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-medium text-ink tabular-nums",
							children: formatINR(row.paise)
						})]
					}, row.category))
				})] })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium text-ink",
					children: "Monthly spending"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Complete dates only. Day-only and unknown lines are excluded."
				}),
				months.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No month to chart until a full date is saved." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chart-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: months.map((row) => ({
								...row,
								label: shortMonthLabel(row.monthKey)
							})),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-line)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tick: {
										fill: "var(--color-muted)",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickFormatter: (value) => formatAxis(Number(value)),
									tick: {
										fill: "var(--color-muted)",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false,
									width: 64
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (value) => formatINR(Number(value ?? 0)) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "paise",
									fill: "var(--color-teal)",
									radius: [
										6,
										6,
										0,
										0
									]
								})
							]
						})
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium text-ink",
					children: "Spending trend"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [monthLabel(viewMonth), ", by day. Refundable deposits are excluded."]
				}),
				!hasDaily ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Nothing with a complete date falls in this month." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chart-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: days,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-line)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "day",
									interval: 4,
									tick: {
										fill: "var(--color-muted)",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickFormatter: (value) => formatAxis(Number(value)),
									tick: {
										fill: "var(--color-muted)",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false,
									width: 64
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									formatter: (value) => formatINR(Number(value ?? 0)),
									labelFormatter: (label) => `Day ${label}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "paise",
									stroke: "var(--color-teal)",
									strokeWidth: 2,
									dot: false
								})
							]
						})
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitCard, {
				title: "Food and everything else",
				leftLabel: "Food",
				rightLabel: "Other",
				left: food.food,
				right: food.other
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium text-ink",
				children: "Needs and wants"
			}), needs.labeledCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Nothing is marked Need or Want yet. Set it when you add the next expense — the history was left blank on purpose." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "Need",
						value: needs.need
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "Want",
						value: needs.want
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
						label: "Unassigned",
						value: needs.unlabeled
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareBar, { parts: [
						needs.need,
						needs.want,
						needs.unlabeled
					] })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium text-ink",
					children: "Fixed and variable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Fixed means rent, electricity, water, mess food, mobile recharge, and college fees."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareBar, { parts: [fixed.fixed, fixed.variable] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 space-y-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Fixed",
							value: fixed.fixed
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
							label: "Variable",
							value: fixed.variable
						})]
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium text-ink",
				children: "Largest transactions"
			}), largest.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No ordinary expenses in this view." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 space-y-3",
				children: largest.map((tx, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-5 text-sm text-muted tabular-nums",
							children: index + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-medium text-ink",
								children: tx.item
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-sm text-muted",
								children: [
									tx.category,
									" · ",
									describeDate(tx)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-ink tabular-nums",
							children: formatINR(tx.amountPaise)
						})
					]
				}, tx.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium text-ink",
					children: "Plan versus actual"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"Actual is only spending dated to ",
						monthLabel(viewMonth),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chart-budget",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: budgetRows,
							layout: "vertical",
							margin: {
								left: 8,
								right: 8
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-line)",
									horizontal: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									tickFormatter: (value) => formatAxis(Number(value)),
									tick: {
										fill: "var(--color-muted)",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									type: "category",
									dataKey: "name",
									width: 78,
									tick: {
										fill: "var(--color-ink)",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (value, name) => [formatINR(Number(value ?? 0)), name === "planned" ? "Planned" : "Actual"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "planned",
									fill: "var(--color-line)",
									radius: [
										0,
										6,
										6,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "actual",
									fill: "var(--color-teal)",
									radius: [
										0,
										6,
										6,
										0
									]
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Grey is the plan. Teal is what is dated to this month."
				})
			] })
		]
	});
}
function SaveMoney() {
	const transactions = useSpend((state) => state.transactions);
	const budgets = useSpend((state) => state.budgets);
	const viewMonth = useSpend((state) => state.viewMonth);
	const dailyLimit = useSpend((state) => state.dailyLimitPaise);
	const setDailyLimit = useSpend((state) => state.setDailyLimit);
	const [limitText, setLimitText] = (0, import_react.useState)(dailyLimit ? paiseToInput(dailyLimit) : "");
	const [limitError, setLimitError] = (0, import_react.useState)(null);
	const now = /* @__PURE__ */ new Date();
	const month = monthStats(transactions, viewMonth, now);
	const remaining = budgetPlanned(budgets) - month.spendingPaise;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium text-ink",
					children: "Daily cap"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Optional. Today’s ordinary spending is measured against it."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					inputMode: "decimal",
					"aria-label": "Daily spending limit",
					value: limitText,
					placeholder: "For example 200",
					onChange: (event) => {
						setLimitText(event.target.value);
						setLimitError(null);
					},
					className: "mt-3 h-12 w-full rounded-md border border-line bg-paper px-3 text-base tabular-nums"
				}),
				limitError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-bad",
					children: limitError
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: saveLimit,
						children: "Save cap"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => {
							setLimitText("");
							setDailyLimit(null);
							setLimitError(null);
						},
						children: "Clear"
					})]
				}),
				dailyLimit && viewMonth === currentMonthKey(now) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-ink",
					children: [
						"Today ",
						formatINR(month.todayPaise),
						" of ",
						formatINR(dailyLimit),
						".",
						" ",
						month.todayPaise > dailyLimit ? `${formatINR(month.todayPaise - dailyLimit)} over.` : `${formatINR(dailyLimit - month.todayPaise)} left.`
					]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-medium text-ink",
					children: ["Left for ", monthLabel(viewMonth)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-3xl font-medium text-ink tabular-nums",
					children: remaining >= 0 ? formatINR(remaining) : formatINR(remaining)
				}),
				daysLeft > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [remaining >= 0 ? `${formatINR(pace)} a day for the ${daysLeft} days left keeps you inside the plan.` : "The plan is already used up. Further spending this month is extra.", month.spendingPaise === 0 ? " This pace comes from the plan, not from dated spending." : ""]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "That month is closed."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium text-ink",
				children: "Where recorded money went"
			}), top.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "Add an expense to see this." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-3",
				children: top.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ink",
						children: row.category
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-ink tabular-nums",
						children: formatINR(row.paise)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 h-2 overflow-hidden rounded-full bg-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-teal",
						style: { width: `${totalActual ? Math.max(4, Math.round(row.paise / totalActual * 100)) : 0}%` }
					})
				})] }, row.category))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium text-ink",
				children: "Repeated small purchases"
			}), repeats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No item has been bought twice under ₹100 yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: repeats.map((repeat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-ink",
						children: [
							repeat.item,
							" · ",
							repeat.count,
							" times"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-ink tabular-nums",
						children: formatINR(repeat.paise)
					})]
				}, repeat.item))
			})] }),
			insights.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Not enough recorded pattern to suggest a cut. Keep logging for a few days."
			}) }) : insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-3xl border border-line bg-card px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-ink",
					children: insight.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: insight.body
				})]
			}, insight.id))
		]
	});
}
function DataTools() {
	const transactions = useSpend((state) => state.transactions);
	const budgets = useSpend((state) => state.budgets);
	const mealNotes = useSpend((state) => state.mealNotes);
	const dailyLimitPaise = useSpend((state) => state.dailyLimitPaise);
	const viewMonth = useSpend((state) => state.viewMonth);
	const prefs = useSpend((state) => state.prefs);
	const replaceAll = useSpend((state) => state.replaceAll);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	function exportCsv() {
		downloadText(`spendwise-${formatExportStamp()}.csv`, toCsv(transactions), "text/csv;charset=utf-8");
		toast("CSV downloaded");
	}
	function exportJson() {
		const backup = toBackup({
			transactions,
			budgets,
			mealNotes,
			dailyLimitPaise,
			viewMonth,
			prefs
		});
		downloadText(`spendwise-backup-${formatExportStamp()}.json`, JSON.stringify(backup, null, 2), "application/json");
		toast("Backup downloaded");
	}
	async function onFile(file) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium text-ink",
				children: "Export"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "CSV is the expense list. JSON is a full backup, including budgets and meal notes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					onClick: exportCsv,
					children: "Download CSV"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					onClick: exportJson,
					children: "Download backup"
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-medium text-ink",
				children: "Restore"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Replacing data asks you to confirm first. Nothing is overwritten by opening a file."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: "application/json,.json",
				"aria-label": "Backup file",
				className: "mt-3 block w-full text-sm text-ink",
				onChange: (event) => void onFile(event.target.files?.[0])
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-bad",
				children: error
			}) : null,
			pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-2xl bg-paper p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-ink",
					children: [
						"Replace ",
						transactions.length,
						" entries on this phone with ",
						pending.transactions.length,
						" from the backup?"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => setPending(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => {
							replaceAll(pending);
							setPending(null);
							toast("Backup restored");
						},
						children: "Replace"
					})]
				})]
			}) : null
		] })]
	});
}
function collapse(rows) {
	if (rows.length <= 7) return rows.map((row) => ({
		name: row.category,
		paise: row.paise
	}));
	const head = rows.slice(0, 6).map((row) => ({
		name: row.category,
		paise: row.paise
	}));
	const rest = rows.slice(6).reduce((sum, row) => sum + row.paise, 0);
	return [...head, {
		name: "Other",
		paise: rest
	}];
}
function ScopeButton({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `press h-9 rounded-lg px-3 text-sm font-medium ${active ? "bg-card text-ink" : "text-muted"}`,
		children
	});
}
function Empty({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-6 text-sm text-muted",
		children
	});
}
function Pair({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-ink tabular-nums",
			children: formatINR(value)
		})]
	});
}
function SplitCard({ title, leftLabel, rightLabel, left, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-medium text-ink",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareBar, { parts: [left, right] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 space-y-1 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: leftLabel,
				value: left
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
				label: rightLabel,
				value: right
			})]
		})]
	})] });
}
function ShareBar({ parts }) {
	const total = parts.reduce((sum, part) => sum + part, 0);
	const colors = [
		"var(--color-teal)",
		"var(--color-ink)",
		"var(--color-line)"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-3 overflow-hidden rounded-full bg-line",
		children: parts.map((part, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
			width: total ? `${part / total * 100}%` : "0%",
			background: colors[index] ?? "var(--color-muted)"
		} }, `${index}-${part}`))
	});
}
//#endregion
export { ReportsScreen };
