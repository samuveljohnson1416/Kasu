package app.kasu.ui

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.text.KeyboardOptions
import app.kasu.logic.CATEGORIES
import app.kasu.logic.DAILY
import app.kasu.logic.Draft
import app.kasu.logic.FIXED
import app.kasu.logic.FOOD
import app.kasu.logic.PAYMENTS
import app.kasu.logic.Transaction
import app.kasu.logic.TxDate
import app.kasu.logic.budgetPlanned
import app.kasu.logic.daysLeft
import app.kasu.logic.describeDate
import app.kasu.logic.formatInr
import app.kasu.logic.groupCategories
import app.kasu.logic.insights
import app.kasu.logic.monthLabel
import app.kasu.logic.monthStats
import app.kasu.logic.overallTotals
import app.kasu.logic.paiseToInput
import app.kasu.logic.parseRupees
import app.kasu.logic.pickLargest
import app.kasu.logic.repeatedSmall
import app.kasu.logic.spentFor
import app.kasu.logic.todayIso
import app.kasu.logic.usedPercent
import java.time.LocalDate

private val pieColors = listOf(
    Color(0xFF0C6B66), Color(0xFF24312F), Color(0xFF3D6D86), Color(0xFF8A6248),
    Color(0xFF5C6B58), Color(0xFF7D4E55), Color(0xFF3F5C4E), Color(0xFF6E675E),
)

@Composable
fun KasuApp(vm: KasuViewModel) {
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(vm.snack) {
        val text = vm.snack ?: return@LaunchedEffect
        snackbar.showSnackbar(text)
        vm.snack = null
    }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) vm.restore(uri)
    }
    Scaffold(
        containerColor = Paper,
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            NavigationBar(containerColor = CardWhite) {
                NavItem(Tab.Home, "Home", Icons.Filled.Home, vm)
                NavItem(Tab.Log, "Log", Icons.Filled.List, vm)
                NavItem(Tab.Add, "Add", Icons.Filled.Add, vm)
                NavItem(Tab.Budget, "Budget", Icons.Filled.Edit, vm)
                NavItem(Tab.Reports, "Reports", Icons.Filled.Info, vm)
            }
        },
    ) { padding ->
        when (vm.tab) {
            Tab.Home -> HomeScreen(vm, padding)
            Tab.Add -> AddScreen(vm, padding)
            Tab.Log -> LogScreen(vm, padding)
            Tab.Budget -> BudgetScreen(vm, padding)
            Tab.Reports -> ReportsScreen(vm, padding) { picker.launch("application/json") }
        }
    }
    val detail = vm.ledger.transactions.find { it.id == vm.detailId }
    if (detail != null) DetailDialog(detail, onClose = { vm.detailId = null }, onEdit = { vm.openAdd(detail.id) }, onDelete = { vm.delete(detail.id) })
}

@Composable
private fun RowScope.NavItem(tab: Tab, label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, vm: KasuViewModel) {
    NavigationBarItem(
        selected = vm.tab == tab,
        onClick = {
            if (tab == Tab.Add) vm.openAdd(null) else {
                vm.editingId = null
                vm.tab = tab
            }
        },
        icon = { Icon(icon, contentDescription = label) },
        label = { Text(label) },
        colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Teal,
            selectedTextColor = Teal,
            indicatorColor = TealSoft,
            unselectedIconColor = Muted,
            unselectedTextColor = Muted,
        ),
    )
}

@Composable
private fun HomeScreen(vm: KasuViewModel, padding: PaddingValues) {
    val today = LocalDate.now()
    val totals = overallTotals(vm.ledger.transactions)
    val month = monthStats(vm.ledger.transactions, vm.ledger.viewMonth, today)
    val planned = budgetPlanned(vm.ledger.budgets)
    val remaining = planned - month.spendingPaise
    val percent = usedPercent(month.spendingPaise, planned)
    val tone = if (percent > 90) Bad else if (percent >= 70) Warn else Good
    val undated = vm.ledger.transactions.count { it.date.kind != "full" }
    val recent = vm.ledger.transactions.sortedByDescending { it.createdAt }.take(5)
    val notes = insights(vm.ledger, today).take(2)
    val leftDays = daysLeft(vm.ledger.viewMonth, today)
    val pace = if (leftDays > 0 && remaining > 0) remaining / leftDays else 0L
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(padding).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Kasu", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Text("Every rupee, once", color = Muted, fontSize = 13.sp)
        MonthBar(vm)
        SoftCard {
            Text(if (remaining >= 0) "Left in ${monthLabel(vm.ledger.viewMonth)}" else "Over ${monthLabel(vm.ledger.viewMonth)}", color = Muted, fontSize = 13.sp)
            Text(formatInr(kotlin.math.abs(remaining)), fontSize = 34.sp, fontWeight = FontWeight.Medium, color = if (percent > 90) Bad else Ink)
            Spacer(Modifier.height(8.dp))
            LinearProgressIndicator(
                progress = { (percent.coerceIn(0, 100) / 100f) },
                modifier = Modifier.fillMaxWidth().height(8.dp),
                color = tone,
                trackColor = Line,
            )
            Text(
                if (percent > 100) "Over budget" else if (percent > 90) "Almost at the limit" else if (percent >= 70) "Getting close" else "Within budget",
                color = tone,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(top = 8.dp),
            )
            if (pace > 0) Text("$leftDays days left · ${formatInr(pace)} a day stays inside the plan", color = Muted, fontSize = 13.sp)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Mini("Today", formatInr(month.todayPaise), Modifier.weight(1f))
            Mini("This month", formatInr(month.spendingPaise), Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Mini("Average / day", formatInr(month.averageDailyPaise), Modifier.weight(1f))
            Mini("Entries", totals.count.toString(), Modifier.weight(1f))
        }
        val cap = vm.ledger.dailyLimitPaise
        if (cap != null && vm.ledger.viewMonth == app.kasu.logic.monthKey(today)) {
            SoftCard {
                val over = month.todayPaise - cap
                Text(if (over > 0) "${formatInr(over)} over today's cap" else "${formatInr(cap - month.todayPaise)} left today", fontWeight = FontWeight.Medium)
            }
        }
        SoftCard {
            Stat("Living expenses", formatInr(totals.actualPaise))
            Stat("Cash outflow", formatInr(totals.outflowPaise))
            Stat("Refundable deposits", formatInr(totals.refundablePaise))
            Stat("Largest", totals.largest?.let { "${it.item} · ${formatInr(it.amountPaise)}" } ?: "—")
            Stat("Highest category", totals.topCategory?.let { "${it.category} · ${formatInr(it.paise)}" } ?: "—")
            Text("The house advance is in outflow and deposits, not in living expenses.", color = Muted, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp))
        }
        notes.forEach { note ->
            SoftCard {
                Text(note.title, fontWeight = FontWeight.Medium)
                Text(note.body, color = Muted, fontSize = 13.sp)
            }
        }
        if (undated > 0) {
            OutlinedButton(onClick = { vm.needsDate = true; vm.tab = Tab.Log }, modifier = Modifier.fillMaxWidth()) {
                Text("$undated dates still incomplete")
            }
        }
        Text("Recent", color = Muted, fontWeight = FontWeight.Medium)
        SoftCard {
            if (recent.isEmpty()) Text("Nothing yet.", color = Muted)
            recent.forEach { tx -> TxRow(tx) { vm.detailId = tx.id } }
        }
        if (vm.ledger.mealNotes.isNotEmpty()) {
            Text("Meal notes", color = Muted, fontWeight = FontWeight.Medium)
            Text("Not money. They never enter a total.", color = Muted, fontSize = 13.sp)
            vm.ledger.mealNotes.forEach { note ->
                var confirm by remember(note.id) { mutableStateOf(false) }
                SoftCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(note.text, modifier = Modifier.weight(1f))
                        TextButton(onClick = { if (confirm) vm.deleteNote(note.id) else confirm = true }) {
                            Text(if (confirm) "Confirm" else "Remove")
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun AddScreen(vm: KasuViewModel, padding: PaddingValues) {
    val editing = vm.ledger.transactions.find { it.id == vm.editingId }
    var amount by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.let { paiseToInput(it.amountPaise) } ?: "") }
    var item by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.item ?: "") }
    var category by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.category ?: vm.ledger.recentCategories.firstOrNull().orEmpty()) }
    var payment by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.paymentMethod ?: if (vm.editingId == null) vm.ledger.lastPayment else null) }
    var need by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.needWant) }
    var refundable by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.refundable ?: false) }
    var notes by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.notes ?: "") }
    var dateMode by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.date?.kind ?: "full") }
    var iso by remember(vm.editingId, vm.formEpoch) { mutableStateOf(editing?.date?.iso?.ifBlank { todayIso() } ?: todayIso()) }
    var day by remember(vm.editingId, vm.formEpoch) { mutableStateOf(if (editing?.date?.kind == "day-only") editing.date.day.toString() else LocalDate.now().dayOfMonth.toString()) }
    var showAll by remember(vm.editingId) { mutableStateOf(false) }
    var showMore by remember(vm.editingId) { mutableStateOf(vm.editingId != null) }
    val quick = (listOf(category).filter { it.isNotBlank() } + vm.ledger.recentCategories + DAILY).distinct().take(8)
    val choices = if (showAll) (CATEGORIES + listOf(category)).filter { it.isNotBlank() }.distinct() else quick
    val repeats = vm.ledger.transactions.filter { !it.refundable }.sortedByDescending { it.createdAt }
        .distinctBy { "${it.item.lowercase()}|${it.category}|${it.amountPaise}" }.take(6)

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(padding).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(if (editing == null) "Add" else "Edit", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Text(if (editing == null) "Amount, what it was, save." else "Saving updates every total.", color = Muted, fontSize = 13.sp)
        if (editing == null && repeats.isNotEmpty()) {
            Text("Again", color = Muted, fontSize = 13.sp)
            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                repeats.forEach { tx ->
                    FilterChip(
                        selected = false,
                        onClick = {
                            item = tx.item
                            amount = paiseToInput(tx.amountPaise)
                            category = tx.category
                            payment = tx.paymentMethod
                            need = tx.needWant
                        },
                        label = { Text("${tx.item} · ${formatInr(tx.amountPaise)}") },
                    )
                }
            }
        }
        OutlinedTextField(
            value = amount,
            onValueChange = { amount = it },
            label = { Text("Amount ₹") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            textStyle = androidx.compose.ui.text.TextStyle(fontSize = 28.sp, fontWeight = FontWeight.Medium),
        )
        OutlinedTextField(value = item, onValueChange = { item = it }, label = { Text("What") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        Text("Category", color = Muted, fontSize = 13.sp)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            choices.forEach { name ->
                FilterChip(selected = category == name, onClick = { category = name }, label = { Text(name) })
            }
        }
        TextButton(onClick = { showAll = !showAll }) { Text(if (showAll) "Fewer categories" else "All categories") }
        Text("Need or want", color = Muted, fontSize = 13.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(selected = need == "need", onClick = { need = if (need == "need") null else "need" }, label = { Text("Need") })
            FilterChip(selected = need == "want", onClick = { need = if (need == "want") null else "want" }, label = { Text("Want") })
        }
        Text("Payment", color = Muted, fontSize = 13.sp)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            PAYMENTS.forEach { (id, label) ->
                FilterChip(selected = payment == id, onClick = { payment = if (payment == id) null else id }, label = { Text(label) })
            }
        }
        when (dateMode) {
            "full" -> OutlinedTextField(value = iso, onValueChange = { iso = it }, label = { Text("Date (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            "day-only" -> OutlinedTextField(value = day, onValueChange = { day = it.filter(Char::isDigit).take(2) }, label = { Text("Day only") }, singleLine = true, modifier = Modifier.fillMaxWidth())
            else -> Text("No date will be stored.", color = Ink)
        }
        TextButton(onClick = { showMore = !showMore }) { Text(if (showMore) "Hide extras" else "Deposit, notes, incomplete date") }
        if (showMore) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TextButton(onClick = { dateMode = "full" }) { Text("Full date") }
                TextButton(onClick = { dateMode = "day-only" }) { Text("Only the day") }
                TextButton(onClick = { dateMode = "unknown" }) { Text("Unknown") }
            }
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.weight(1f)) {
                    Text("Refundable deposit", fontWeight = FontWeight.Medium)
                    Text("Cash out only. Not a living expense.", color = Muted, fontSize = 13.sp)
                }
                Switch(checked = refundable, onCheckedChange = { refundable = it })
            }
            OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth())
        }
        Button(
            onClick = {
                val paise = parseRupees(amount)
                if (paise == null) {
                    vm.snack = "Enter an amount above zero. Paise are allowed, negatives are not."
                    return@Button
                }
                val date = when (dateMode) {
                    "unknown" -> TxDate("unknown")
                    "day-only" -> TxDate("day-only", day = day.toIntOrNull() ?: 0)
                    else -> TxDate("full", iso = iso.trim())
                }
                vm.save(Draft(item, paise, category, payment, need, refundable, notes, date))
            },
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) { Text(if (editing == null) "Save" else "Save changes") }
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun LogScreen(vm: KasuViewModel, padding: PaddingValues) {
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("All") }
    var sort by remember { mutableStateOf("Newest") }
    var need by remember { mutableStateOf("All") }
    var monthFilter by remember { mutableStateOf("All") }
    LaunchedEffect(vm.needsDate) {
        if (vm.needsDate) {
            monthFilter = "Needs a date"
            vm.needsDate = false
        }
    }
    val rows = vm.ledger.transactions.filter { tx ->
        (query.isBlank() || tx.item.contains(query, ignoreCase = true)) &&
            (category == "All" || tx.category == category) &&
            (need == "All" || (need == "Unassigned" && tx.needWant == null) || tx.needWant == need.lowercase()) &&
            when (monthFilter) {
                "All" -> true
                "Needs a date" -> tx.date.kind != "full"
                else -> tx.date.kind == "full" && tx.date.iso.startsWith(monthFilter)
            }
    }.let { list ->
        when (sort) {
            "Oldest" -> list.sortedBy { it.createdAt }
            "Highest" -> list.sortedByDescending { it.amountPaise }
            "Lowest" -> list.sortedBy { it.amountPaise }
            else -> list.sortedByDescending { it.createdAt }
        }
    }
    var applyMonth by remember { mutableStateOf("") }
    var confirmApply by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Transactions", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        OutlinedTextField(value = query, onValueChange = { query = it }, label = { Text("Search item") }, singleLine = true, modifier = Modifier.fillMaxWidth())
        FlowPick(listOf("All") + CATEGORIES, category) { category = it }
        FlowPick(listOf("All", "Needs a date", vm.ledger.viewMonth), monthFilter) { monthFilter = it }
        FlowPick(listOf("All", "Need", "Want", "Unassigned"), need) { need = it }
        FlowPick(listOf("Newest", "Oldest", "Highest", "Lowest"), sort) { sort = it }
        Text("${rows.size} shown", color = Muted, fontSize = 13.sp)
        val dayOnly = vm.ledger.transactions.count { it.date.kind == "day-only" }
        if (dayOnly > 0) {
            SoftCard {
                Text("$dayOnly entries have a day, but no month", fontWeight = FontWeight.Medium)
                Text("Type a month like 2026-09. The written day is kept. Nothing is guessed.", color = Muted, fontSize = 13.sp)
                OutlinedTextField(value = applyMonth, onValueChange = { applyMonth = it }, label = { Text("Month YYYY-MM") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Button(onClick = { confirmApply = true }, enabled = Regex("""\d{4}-\d{2}""").matches(applyMonth)) { Text("Apply month") }
            }
        }
        if (rows.isEmpty()) Text("No matching expenses.", color = Muted)
        rows.forEach { tx -> TxRow(tx) { vm.detailId = tx.id } }
        Spacer(Modifier.height(12.dp))
    }
    if (confirmApply) {
        AlertDialog(
            onDismissRequest = { confirmApply = false },
            title = { Text("Set the month?") },
            text = { Text("Day-only lines will become ${monthLabel(applyMonth)}, using the day already written.") },
            confirmButton = {
                TextButton(onClick = {
                    val count = vm.assignMonth(applyMonth)
                    vm.snack = "Dated $count entries"
                    confirmApply = false
                }) { Text("Apply") }
            },
            dismissButton = { TextButton(onClick = { confirmApply = false }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun BudgetScreen(vm: KasuViewModel, padding: PaddingValues) {
    val planned = budgetPlanned(vm.ledger.budgets)
    val spent = monthStats(vm.ledger.transactions, vm.ledger.viewMonth).spendingPaise
    val percent = usedPercent(spent, planned)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Budget", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Text("Plans only. Editing these does not add expenses.", color = Muted, fontSize = 13.sp)
        MonthBar(vm)
        SoftCard {
            Text(formatInr(planned), fontSize = 28.sp, fontWeight = FontWeight.Medium)
            Text("${formatInr(spent)} dated to ${monthLabel(vm.ledger.viewMonth)} · $percent% of the plan", color = Muted, fontSize = 13.sp)
            LinearProgressIndicator(progress = { percent.coerceIn(0, 100) / 100f }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp), color = Teal, trackColor = Line)
        }
        vm.ledger.budgets.forEach { line ->
            var text by remember(line.id, line.plannedPaise) { mutableStateOf(paiseToInput(line.plannedPaise)) }
            val actual = spentFor(vm.ledger.transactions, line.categories, vm.ledger.viewMonth)
            val linePercent = usedPercent(actual, line.plannedPaise)
            SoftCard {
                Text(line.label, fontWeight = FontWeight.Medium)
                if (line.hint.isNotBlank()) Text(line.hint, color = Muted, fontSize = 13.sp)
                Text("Spent ${formatInr(actual)} · ${formatInr(line.plannedPaise - actual)} left · $linePercent%", color = Muted, fontSize = 13.sp)
                LinearProgressIndicator(progress = { linePercent.coerceIn(0, 100) / 100f }, modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp), color = if (linePercent > 90) Bad else Teal, trackColor = Line)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(value = text, onValueChange = { text = it }, label = { Text("Planned ₹") }, singleLine = true, modifier = Modifier.weight(1f), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
                    Spacer(Modifier.width(8.dp))
                    Button(onClick = {
                        val paise = when {
                            text.isBlank() || text == "0" || text == "0.0" || text == "0.00" -> 0L
                            else -> parseRupees(text)
                        }
                        if (paise == null) {
                            vm.snack = "Enter a plan of zero or more."
                            return@Button
                        }
                        vm.setBudget(line.id, paise)
                        vm.snack = "Plan updated"
                    }) { Text("Save") }
                }
            }
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun ReportsScreen(vm: KasuViewModel, padding: PaddingValues, onImport: () -> Unit) {
    val actual = vm.ledger.transactions.filter { !it.refundable }
    val dated = actual.filter { it.date.kind == "full" }
    val categories = groupCategories(actual)
    val monthCategories = groupCategories(actual.filter { app.kasu.logic.inMonth(it, vm.ledger.viewMonth) })
    val food = actual.filter { it.category in FOOD }.sumOf { it.amountPaise }
    val other = actual.sumOf { it.amountPaise } - food
    val need = actual.filter { it.needWant == "need" }.sumOf { it.amountPaise }
    val want = actual.filter { it.needWant == "want" }.sumOf { it.amountPaise }
    val unlabeled = actual.filter { it.needWant == null }.sumOf { it.amountPaise }
    val fixed = actual.filter { it.category in FIXED }.sumOf { it.amountPaise }
    val variable = actual.sumOf { it.amountPaise } - fixed
    val top = actual.sortedByDescending { it.amountPaise }.take(10)
    val months = dated.groupBy { it.date.iso.substring(0, 7) }.toSortedMap().map { it.key to it.value.sumOf { tx -> tx.amountPaise } }
    var limit by remember(vm.ledger.dailyLimitPaise) { mutableStateOf(vm.ledger.dailyLimitPaise?.let { paiseToInput(it) } ?: "") }
    val planned = budgetPlanned(vm.ledger.budgets)
    val monthSpent = monthStats(vm.ledger.transactions, vm.ledger.viewMonth).spendingPaise
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Reports", style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        Text("Ordinary spending. The refundable advance stays out of these charts.", color = Muted, fontSize = 13.sp)
        MonthBar(vm)
        SoftCard {
            Text("Categories", fontWeight = FontWeight.Medium)
            if (categories.isEmpty()) Text("No living expenses yet.", color = Muted) else {
                Pie(categories.map { it.category to it.paise })
                categories.take(8).forEach { row ->
                    Stat(row.category, formatInr(row.paise))
                }
            }
        }
        SoftCard {
            Text("Monthly spending", fontWeight = FontWeight.Medium)
            if (months.isEmpty()) Text("No complete dates yet, so this chart is empty.", color = Muted, fontSize = 13.sp)
            else months.forEach { (key, paise) -> BarRow(monthLabel(key), paise, months.maxOf { it.second }) }
        }
        SoftCard {
            Text("This month by day", fontWeight = FontWeight.Medium)
            val days = dated.filter { app.kasu.logic.inMonth(TransactionShim(it), vm.ledger.viewMonth) }
            if (days.isEmpty()) Text("Nothing with a full date in ${monthLabel(vm.ledger.viewMonth)}.", color = Muted, fontSize = 13.sp)
            else days.groupBy { it.date.iso }.toSortedMap().forEach { (iso, list) ->
                Stat(iso, formatInr(list.sumOf { it.amountPaise }))
            }
        }
        SoftCard {
            Text("Food and other", fontWeight = FontWeight.Medium)
            Stat("Food", formatInr(food))
            Stat("Everything else", formatInr(other))
        }
        SoftCard {
            Text("Needs and wants", fontWeight = FontWeight.Medium)
            Stat("Need", formatInr(need))
            Stat("Want", formatInr(want))
            Stat("Not labeled", formatInr(unlabeled))
            if (need == 0L && want == 0L) Text("Nothing is marked need or want yet.", color = Muted, fontSize = 13.sp)
        }
        SoftCard {
            Text("Fixed and variable", fontWeight = FontWeight.Medium)
            Stat("Fixed", formatInr(fixed))
            Stat("Variable", formatInr(variable))
        }
        SoftCard {
            Text("Largest ten", fontWeight = FontWeight.Medium)
            top.forEach { tx -> TxRow(tx) { vm.detailId = tx.id } }
        }
        SoftCard {
            Text("Plan versus ${monthLabel(vm.ledger.viewMonth)}", fontWeight = FontWeight.Medium)
            Stat("Planned", formatInr(planned))
            Stat("Spent", formatInr(monthSpent))
            monthCategories.forEach { row -> Stat(row.category, formatInr(row.paise)) }
            if (monthCategories.isEmpty()) Text("No dated spending in this month.", color = Muted, fontSize = 13.sp)
        }
        SoftCard {
            Text("Save money", fontWeight = FontWeight.Medium)
            val repeats = repeatedSmall(actual)
            if (repeats.isEmpty()) Text("No item has been bought twice under ₹100 yet.", color = Muted, fontSize = 13.sp)
            repeats.take(5).forEach { Stat("${it.item} · ${it.count} times", formatInr(it.paise)) }
            insights(vm.ledger).forEach {
                Text(it.title, fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 8.dp))
                Text(it.body, color = Muted, fontSize = 13.sp)
            }
            OutlinedTextField(value = limit, onValueChange = { limit = it }, label = { Text("Daily cap ₹") }, singleLine = true, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = {
                    if (limit.isBlank()) vm.setDailyLimit(null) else {
                        val parsed = parseRupees(limit)
                        if (parsed == null) vm.snack = "Enter an amount above zero." else vm.setDailyLimit(parsed)
                    }
                }) { Text("Save cap") }
                OutlinedButton(onClick = { limit = ""; vm.setDailyLimit(null) }) { Text("Clear") }
            }
        }
        SoftCard {
            Text("Your data", fontWeight = FontWeight.Medium)
            Text("Stays on this phone. Export a backup before you uninstall if you want to keep it.", color = Muted, fontSize = 13.sp)
            Button(onClick = { vm.export("csv") }, modifier = Modifier.fillMaxWidth()) { Text("Share CSV") }
            Button(onClick = { vm.export("json") }, modifier = Modifier.fillMaxWidth()) { Text("Share backup") }
            OutlinedButton(onClick = onImport, modifier = Modifier.fillMaxWidth()) { Text("Restore backup") }
        }
        Spacer(Modifier.height(12.dp))
    }
}

private fun TransactionShim(tx: app.kasu.logic.Transaction) = tx

@Composable
private fun DetailDialog(tx: Transaction, onClose: () -> Unit, onEdit: () -> Unit, onDelete: () -> Unit) {
    var confirm by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text(tx.item) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(formatInr(tx.amountPaise), fontSize = 22.sp, fontWeight = FontWeight.Medium)
                Text(tx.category)
                Text(describeDate(tx), color = Muted)
                Text(app.kasu.logic.paymentLabel(tx.paymentMethod), color = Muted)
                Text(app.kasu.logic.needLabel(tx.needWant), color = Muted)
                Text(if (tx.refundable) "Refundable deposit. Cash outflow only." else "Living expense.", color = Muted, fontSize = 13.sp)
                if (tx.notes.isNotBlank()) Text(tx.notes)
            }
        },
        confirmButton = { TextButton(onClick = onEdit) { Text("Edit") } },
        dismissButton = {
            Row {
                TextButton(onClick = { if (confirm) onDelete() else confirm = true }) { Text(if (confirm) "Delete now" else "Delete", color = Bad) }
                TextButton(onClick = onClose) { Text("Close") }
            }
        },
    )
}

@Composable
private fun MonthBar(vm: KasuViewModel) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        TextButton(onClick = { vm.shiftMonth(-1) }) { Text("Prev") }
        Text(monthLabel(vm.ledger.viewMonth), fontWeight = FontWeight.Medium)
        TextButton(onClick = { vm.shiftMonth(1) }) { Text("Next") }
    }
}

@Composable
private fun SoftCard(content: @Composable () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = CardWhite),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth(),
    ) { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp), content = { content() }) }
}

@Composable
private fun Mini(label: String, value: String, modifier: Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = CardWhite), shape = RoundedCornerShape(16.dp)) {
        Column(Modifier.padding(12.dp)) {
            Text(label, color = Muted, fontSize = 13.sp)
            Text(value, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun Stat(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = Muted, modifier = Modifier.weight(1f), fontSize = 14.sp)
        Spacer(Modifier.width(8.dp))
        Text(value, fontWeight = FontWeight.Medium, fontSize = 14.sp)
    }
}

@Composable
private fun TxRow(tx: Transaction, onClick: () -> Unit) {
    TextButton(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(tx.item, color = Ink, fontWeight = FontWeight.Medium)
                Text("${tx.category} · ${describeDate(tx)}${if (tx.refundable) " · Refundable" else ""}", color = Muted, fontSize = 12.sp)
            }
            Text(formatInr(tx.amountPaise), color = Ink, fontWeight = FontWeight.Medium)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowPick(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        options.distinct().forEach { option ->
            FilterChip(selected = selected == option, onClick = { onSelect(option) }, label = { Text(if (option.matches(Regex("""\d{4}-\d{2}"""))) monthLabel(option) else option) })
        }
    }
}

@Composable
private fun Pie(parts: List<Pair<String, Long>>) {
    val total = parts.sumOf { it.second }.coerceAtLeast(1L)
    Canvas(Modifier.fillMaxWidth().height(160.dp).padding(vertical = 8.dp)) {
        val diameter = size.minDimension
        val left = (size.width - diameter) / 2f
        var start = -90f
        parts.forEachIndexed { index, (_, value) ->
            val sweep = value * 360f / total
            drawArc(pieColors[index % pieColors.size], start, sweep, true, topLeft = Offset(left, 0f), size = Size(diameter, diameter))
            start += sweep
        }
    }
}

@Composable
private fun BarRow(label: String, value: Long, max: Long) {
    Column(Modifier.padding(vertical = 4.dp)) {
        Stat(label, formatInr(value))
        LinearProgressIndicator(progress = { if (max <= 0) 0f else value.toFloat() / max.toFloat() }, modifier = Modifier.fillMaxWidth(), color = Teal, trackColor = Line)
    }
}
