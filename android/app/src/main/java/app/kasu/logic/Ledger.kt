package app.kasu.logic

import kotlinx.serialization.Serializable
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToInt

val CATEGORIES = listOf(
    "Rent", "Electricity", "Water", "Advance Deposit", "Mess Food", "Breakfast", "Lunch", "Dinner",
    "Snacks", "Tea and Coffee", "Drinks", "Groceries", "Food", "Transport", "Mobile Recharge",
    "College Fees", "Stationery", "Toiletries", "Laundry", "Household Items", "Electronics",
    "Clothing", "Footwear", "Medical", "Entertainment", "Shopping", "Emergency", "Miscellaneous",
)

val FOOD = setOf(
    "Mess Food", "Breakfast", "Lunch", "Dinner", "Snacks", "Tea and Coffee", "Drinks", "Groceries", "Food",
)
val FIXED = setOf("Rent", "Electricity", "Water", "Mobile Recharge", "College Fees", "Mess Food")
val SNACKISH = setOf("Snacks", "Tea and Coffee", "Drinks")
val DAILY = listOf("Breakfast", "Lunch", "Dinner", "Snacks", "Tea and Coffee", "Drinks", "Transport", "Mess Food")

val PAYMENTS = listOf(
    "cash" to "Cash",
    "upi" to "UPI",
    "card" to "Card",
    "bank" to "Bank Transfer",
    "unspecified" to "Not Specified",
)

fun paymentLabel(id: String?): String = PAYMENTS.find { it.first == id }?.second ?: "Unassigned"

fun needLabel(id: String?): String = when (id) {
    "need" -> "Need"
    "want" -> "Want"
    else -> "Unassigned"
}

@Serializable
data class TxDate(val kind: String, val iso: String = "", val day: Int = 0)

@Serializable
data class Transaction(
    val id: String,
    val item: String,
    val amountPaise: Long,
    val category: String,
    val paymentMethod: String? = null,
    val needWant: String? = null,
    val refundable: Boolean = false,
    val notes: String = "",
    val date: TxDate,
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class BudgetLine(
    val id: String,
    val label: String,
    val categories: List<String>,
    val plannedPaise: Long,
    val hint: String = "",
)

@Serializable
data class MealNote(val id: String, val text: String)

@Serializable
data class Ledger(
    val transactions: List<Transaction>,
    val budgets: List<BudgetLine>,
    val mealNotes: List<MealNote>,
    val dailyLimitPaise: Long? = null,
    val viewMonth: String,
    val recentCategories: List<String> = emptyList(),
    val lastPayment: String? = null,
)

@Serializable
data class BackupFile(
    val version: Int = 1,
    val app: String = "Kasu",
    val transactions: List<Transaction>,
    val budgets: List<BudgetLine>,
    val mealNotes: List<MealNote> = emptyList(),
    val dailyLimitPaise: Long? = null,
    val viewMonth: String = "",
    val recentCategories: List<String> = emptyList(),
    val lastPayment: String? = null,
)

data class Draft(
    val item: String,
    val amountPaise: Long,
    val category: String,
    val paymentMethod: String?,
    val needWant: String?,
    val refundable: Boolean,
    val notes: String,
    val date: TxDate,
)

data class CategoryTotal(val category: String, val paise: Long, val count: Int)

fun defaultBudgets(): List<BudgetLine> = listOf(
    BudgetLine("rent", "Rent", listOf("Rent"), 0),
    BudgetLine("electricity", "Electricity", listOf("Electricity"), 0),
    BudgetLine("water", "Water", listOf("Water"), 0),
    BudgetLine("mess", "Mess Food — Lunch and Dinner", listOf("Mess Food", "Lunch", "Dinner"), 0, "Covers mess, lunch, and dinner."),
    BudgetLine("breakfast", "Breakfast", listOf("Breakfast"), 0),
    BudgetLine("snacks", "Snacks", listOf("Snacks"), 0),
    BudgetLine("transport", "Transport", listOf("Transport"), 0),
    BudgetLine("mobile", "Mobile Recharge", listOf("Mobile Recharge"), 0),
    BudgetLine("toiletries", "Toiletries", listOf("Toiletries"), 0),
    BudgetLine("laundry", "Laundry", listOf("Laundry"), 0),
    BudgetLine("medical", "Medical", listOf("Medical"), 0),
    BudgetLine("stationery", "Stationery", listOf("Stationery"), 0),
    BudgetLine("misc", "Miscellaneous", listOf("Miscellaneous"), 0),
)

fun mergeBudgets(saved: List<BudgetLine>): List<BudgetLine> {
    val amounts = saved.associate { it.id to it.plannedPaise }
    return defaultBudgets().map { line ->
        val planned = amounts[line.id]
        if (planned != null && planned >= 0) line.copy(plannedPaise = planned) else line
    }
}

fun seedLedger(today: LocalDate = LocalDate.now()): Ledger = Ledger(
    transactions = emptyList(),
    budgets = defaultBudgets(),
    mealNotes = emptyList(),
    viewMonth = monthKey(today),
)

fun formatInr(paise: Long): String {
    val sign = if (paise < 0) "-" else ""
    val absPaise = abs(paise)
    val rupees = absPaise / 100
    val frac = absPaise % 100
    return "$sign₹${groupIndian(rupees)}.${frac.toString().padStart(2, '0')}"
}

fun groupIndian(value: Long): String {
    val text = value.toString()
    if (text.length <= 3) return text
    val head = text.dropLast(3)
    val tail = text.takeLast(3)
    val grouped = head.reversed().chunked(2).joinToString(",").reversed()
    return "$grouped,$tail"
}

fun paiseToInput(paise: Long): String {
    val absPaise = abs(paise)
    val rupees = absPaise / 100
    val frac = absPaise % 100
    return if (frac == 0L) rupees.toString() else "$rupees.${frac.toString().padStart(2, '0')}"
}

fun parseRupees(raw: String): Long? {
    val cleaned = raw.replace("₹", "").replace(",", "").replace(" ", "").trim()
    if (!Regex("""^\d+(\.\d{1,2})?$""").matches(cleaned)) return null
    val parts = cleaned.split(".")
    val whole = parts[0].toLongOrNull() ?: return null
    val frac = if (parts.size == 2) parts[1].padEnd(2, '0').toLongOrNull() ?: return null else 0L
    val paise = whole * 100 + frac
    if (paise <= 0 || paise > 10_000_000_000L) return null
    return paise
}

fun monthKey(date: LocalDate = LocalDate.now()): String = "%04d-%02d".format(date.year, date.monthValue)

fun todayIso(date: LocalDate = LocalDate.now()): String = date.toString()

fun monthLabel(key: String): String {
    val parts = key.split("-")
    if (parts.size != 2) return key
    val date = LocalDate.of(parts[0].toInt(), parts[1].toInt(), 1)
    return date.format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH))
}

fun shiftMonthKey(key: String, delta: Int): String {
    val parts = key.split("-")
    val date = LocalDate.of(parts[0].toInt(), parts[1].toInt(), 1).plusMonths(delta.toLong())
    return monthKey(date)
}

fun daysInMonth(key: String): Int {
    val parts = key.split("-")
    return LocalDate.of(parts[0].toInt(), parts[1].toInt(), 1).lengthOfMonth()
}

fun elapsedDays(key: String, today: LocalDate = LocalDate.now()): Int {
    val current = monthKey(today)
    return when {
        key < current -> daysInMonth(key)
        key > current -> 0
        else -> today.dayOfMonth
    }
}

fun daysLeft(key: String, today: LocalDate = LocalDate.now()): Int {
    val current = monthKey(today)
    return when {
        key < current -> 0
        key > current -> daysInMonth(key)
        else -> daysInMonth(key) - today.dayOfMonth + 1
    }
}

fun inMonth(tx: Transaction, key: String): Boolean =
    tx.date.kind == "full" && tx.date.iso.length >= 7 && tx.date.iso.substring(0, 7) == key

fun groupCategories(transactions: List<Transaction>): List<CategoryTotal> {
    val map = linkedMapOf<String, CategoryTotal>()
    for (tx in transactions) {
        val current = map[tx.category]
        map[tx.category] = if (current == null) {
            CategoryTotal(tx.category, tx.amountPaise, 1)
        } else {
            current.copy(paise = current.paise + tx.amountPaise, count = current.count + 1)
        }
    }
    return map.values.sortedWith(compareByDescending<CategoryTotal> { it.paise }.thenBy { it.category })
}

fun pickLargest(transactions: List<Transaction>): Transaction? =
    transactions.maxWithOrNull(compareBy<Transaction> { it.amountPaise }.thenBy { it.createdAt })

data class Overall(
    val actualPaise: Long,
    val refundablePaise: Long,
    val outflowPaise: Long,
    val count: Int,
    val largest: Transaction?,
    val topCategory: CategoryTotal?,
)

fun overallTotals(transactions: List<Transaction>): Overall {
    val actual = transactions.filter { !it.refundable }
    val refunds = transactions.filter { it.refundable }
    val categories = groupCategories(actual)
    return Overall(
        actualPaise = actual.sumOf { it.amountPaise },
        refundablePaise = refunds.sumOf { it.amountPaise },
        outflowPaise = transactions.sumOf { it.amountPaise },
        count = transactions.size,
        largest = pickLargest(actual),
        topCategory = categories.firstOrNull(),
    )
}

data class MonthStats(
    val spendingPaise: Long,
    val todayPaise: Long,
    val averageDailyPaise: Long,
    val count: Int,
    val byCategory: List<CategoryTotal>,
)

fun monthStats(transactions: List<Transaction>, key: String, today: LocalDate = LocalDate.now()): MonthStats {
    val inMonth = transactions.filter { inMonth(it, key) }
    val spending = inMonth.filter { !it.refundable }
    val todayRows = spending.filter { it.date.iso == todayIso(today) }
    val elapsed = elapsedDays(key, today)
    val spent = spending.sumOf { it.amountPaise }
    return MonthStats(
        spendingPaise = spent,
        todayPaise = todayRows.sumOf { it.amountPaise },
        averageDailyPaise = if (elapsed > 0) spent / elapsed else 0,
        count = inMonth.size,
        byCategory = groupCategories(spending),
    )
}

fun budgetPlanned(budgets: List<BudgetLine>): Long = budgets.sumOf { it.plannedPaise }

fun spentFor(transactions: List<Transaction>, categories: List<String>, month: String): Long {
    val wanted = categories.toSet()
    return transactions.filter { !it.refundable && it.category in wanted && inMonth(it, month) }
        .sumOf { it.amountPaise }
}

fun usedPercent(spent: Long, planned: Long): Int {
    if (planned <= 0L) return if (spent > 0) 100 else 0
    return ((spent.toDouble() / planned.toDouble()) * 100).roundToInt()
}

fun describeDate(tx: Transaction): String = when (tx.date.kind) {
    "full" -> {
        val date = runCatching { LocalDate.parse(tx.date.iso) }.getOrNull()
        date?.format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)) ?: tx.date.iso
    }
    "day-only" -> "${ordinal(tx.date.day)} · month not set"
    else -> "Date not set"
}

fun ordinal(day: Int): String {
    val mod100 = day % 100
    val mod10 = day % 10
    val suffix = if (mod100 in 11..13) "th" else when (mod10) {
        1 -> "st"
        2 -> "nd"
        3 -> "rd"
        else -> "th"
    }
    return "$day$suffix"
}

data class RepeatBuy(val item: String, val count: Int, val paise: Long)

fun repeatedSmall(transactions: List<Transaction>, maxEach: Long = 10_000): List<RepeatBuy> {
    val groups = linkedMapOf<String, Triple<String, Int, Long>>()
    val tooBig = mutableSetOf<String>()
    for (tx in transactions) {
        if (tx.refundable) continue
        val key = tx.item.trim().lowercase().replace(Regex("\\s+"), " ")
        if (key.isEmpty()) continue
        if (tx.amountPaise > maxEach) tooBig += key
        val current = groups[key]
        groups[key] = if (current == null) Triple(tx.item.trim(), 1, tx.amountPaise)
        else Triple(current.first, current.second + 1, current.third + tx.amountPaise)
    }
    return groups.filter { it.key !in tooBig && it.value.second >= 2 }
        .map { RepeatBuy(it.value.first, it.value.second, it.value.third) }
        .sortedWith(compareByDescending<RepeatBuy> { it.paise }.thenByDescending { it.count })
}

fun validateDraft(draft: Draft): String? {
    if (draft.item.isBlank()) return "Add what you paid for."
    if (draft.amountPaise <= 0) return "Enter an amount above zero."
    if (draft.category.isBlank()) return "Choose a category."
    if (draft.date.kind == "day-only" && draft.date.day !in 1..31) return "Day must be between 1 and 31."
    if (draft.date.kind == "full" && runCatching { LocalDate.parse(draft.date.iso) }.isFailure) {
        return "Choose a real date, or mark it unknown."
    }
    return null
}

fun toCsv(transactions: List<Transaction>): String {
    fun cell(value: String): String {
        val guarded = if (value.isNotEmpty() && value.first() in "=+-@") "'$value" else value
        return if (guarded.any { it == '"' || it == ',' || it == '\n' }) "\"${guarded.replace("\"", "\"\"")}\"" else guarded
    }
    val header = "Id,Date status,Date,Day,Item,Amount INR,Category,Payment method,Need or want,Refundable,Notes"
    val lines = transactions.map { tx ->
        val status = tx.date.kind
        val date = if (tx.date.kind == "full") tx.date.iso else ""
        val day = if (tx.date.kind == "day-only") tx.date.day.toString() else ""
        listOf(
            tx.id, status, date, day, tx.item, paiseToInput(tx.amountPaise), tx.category,
            if (tx.paymentMethod == null) "" else paymentLabel(tx.paymentMethod),
            tx.needWant ?: "",
            if (tx.refundable) "Yes" else "No",
            tx.notes,
        ).joinToString(",") { cell(it) }
    }
    return "\uFEFF" + (listOf(header) + lines).joinToString("\n") + "\n"
}

data class Insight(val title: String, val body: String)

fun insights(ledger: Ledger, today: LocalDate = LocalDate.now()): List<Insight> {
    val out = mutableListOf<Insight>()
    val month = ledger.viewMonth
    for (line in ledger.budgets) {
        val spent = spentFor(ledger.transactions, line.categories, month)
        if (line.plannedPaise > 0 && spent > line.plannedPaise) {
            out += Insight(
                "${line.label} is over the plan",
                "${formatInr(spent)} dated to ${monthLabel(month)} against ${formatInr(line.plannedPaise)} planned.",
            )
        }
    }
    val repeats = repeatedSmall(ledger.transactions).take(3)
    if (repeats.isNotEmpty()) {
        val line = repeats.joinToString("; ") { "${it.item} × ${it.count} (${formatInr(it.paise)})" }
        out += Insight("Small buys are adding up", line)
    }
    val actual = ledger.transactions.filter { !it.refundable }
    val snack = actual.filter { it.category in SNACKISH }.sumOf { it.amountPaise }
    if (snack >= 20_000) {
        out += Insight("Snacks, tea, and drinks", "${formatInr(snack)} so far. Skipping one a day is the easiest cut.")
    }
    val left = daysLeft(month, today)
    val remaining = budgetPlanned(ledger.budgets) - monthStats(ledger.transactions, month, today).spendingPaise
    if (left > 0 && remaining > 0 && monthStats(ledger.transactions, month, today).spendingPaise == 0L &&
        actual.none { it.date.kind == "full" }
    ) {
        out += Insight(
            "Dates are still open",
            "Notebook lines have no month yet, so ${monthLabel(month)} spending is still zero. Fix them in Log when you know the month.",
        )
    }
    return out
}
