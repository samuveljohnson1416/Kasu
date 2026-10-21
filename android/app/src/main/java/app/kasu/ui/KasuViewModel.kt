package app.kasu.ui

import android.app.Application
import android.content.ClipData
import android.content.Intent
import android.net.Uri
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.FileProvider
import androidx.lifecycle.AndroidViewModel
import app.kasu.data.LedgerStore
import app.kasu.logic.BackupFile
import app.kasu.logic.Draft
import app.kasu.logic.Ledger
import app.kasu.logic.mergeBudgets
import app.kasu.logic.monthKey
import app.kasu.logic.shiftMonthKey
import app.kasu.logic.toCsv
import app.kasu.logic.validateDraft
import kotlinx.serialization.json.Json
import java.io.File
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

enum class Tab { Home, Log, Add, Budget, Reports }

class KasuViewModel(app: Application) : AndroidViewModel(app) {
    var ledger by mutableStateOf(LedgerStore.load(app))
        private set
    var tab by mutableStateOf(Tab.Home)
    var editingId by mutableStateOf<String?>(null)
    var detailId by mutableStateOf<String?>(null)
    var snack by mutableStateOf<String?>(null)
    var formEpoch by mutableIntStateOf(0)
    var needsDate by mutableStateOf(false)

    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true; prettyPrint = true }

    private fun persist(next: Ledger) {
        ledger = next
        LedgerStore.save(getApplication(), next)
    }

    fun openAdd(id: String? = null) {
        editingId = id
        detailId = null
        tab = Tab.Add
    }

    fun save(draft: Draft): Boolean {
        val error = validateDraft(draft)
        if (error != null) {
            snack = error
            return false
        }
        val now = Instant.now().toString()
        val id = editingId
        val transactions = if (id == null) {
            val tx = draft.toTransaction(UUID.randomUUID().toString(), now, now)
            listOf(tx) + ledger.transactions
        } else {
            ledger.transactions.map { tx ->
                if (tx.id == id) draft.toTransaction(tx.id, tx.createdAt, now) else tx
            }
        }
        val recent = listOf(draft.category) + ledger.recentCategories.filter { it != draft.category }
        persist(
            ledger.copy(
                transactions = transactions,
                recentCategories = recent.take(6),
                lastPayment = draft.paymentMethod ?: ledger.lastPayment,
            ),
        )
        vibrate()
        snack = if (id == null) "Saved ${draft.item.trim()}" else "Updated ${draft.item.trim()}"
        if (id == null) formEpoch += 1 else {
            editingId = null
            tab = Tab.Log
        }
        return true
    }

    fun delete(id: String) {
        persist(ledger.copy(transactions = ledger.transactions.filter { it.id != id }))
        if (detailId == id) detailId = null
        if (editingId == id) editingId = null
        snack = "Deleted"
    }

    fun setBudget(id: String, paise: Long) {
        if (paise < 0) return
        persist(ledger.copy(budgets = ledger.budgets.map { if (it.id == id) it.copy(plannedPaise = paise) else it }))
    }

    fun setDailyLimit(paise: Long?) {
        persist(ledger.copy(dailyLimitPaise = paise?.takeIf { it > 0 }))
        snack = if (paise == null || paise <= 0) "Daily cap cleared" else "Daily cap saved"
    }

    fun shiftMonth(delta: Int) {
        persist(ledger.copy(viewMonth = shiftMonthKey(ledger.viewMonth, delta)))
    }

    fun deleteNote(id: String) {
        persist(ledger.copy(mealNotes = ledger.mealNotes.filter { it.id != id }))
    }

    fun assignMonth(month: String): Int {
        if (!Regex("""\d{4}-\d{2}""").matches(month)) return 0
        var updated = 0
        val now = Instant.now().toString()
        val next = ledger.transactions.map { tx ->
            if (tx.date.kind != "day-only") return@map tx
            val iso = "%s-%02d".format(month, tx.date.day)
            val real = runCatching { LocalDate.parse(iso) }.isSuccess
            if (!real) tx else {
                updated += 1
                tx.copy(date = tx.date.copy(kind = "full", iso = iso), updatedAt = now)
            }
        }
        if (updated > 0) persist(ledger.copy(transactions = next))
        return updated
    }

    fun export(kind: String) {
        val context = getApplication<Application>()
        val dir = File(context.cacheDir, "export").apply { mkdirs() }
        val file = File(dir, if (kind == "csv") "kasu.csv" else "kasu-backup.json")
        val text = if (kind == "csv") toCsv(ledger.transactions) else json.encodeToString(BackupFile.serializer(), LedgerStore.backupOf(ledger))
        file.writeText(text)
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", file)
        val type = if (kind == "csv") "text/csv" else "application/json"
        val send = Intent(Intent.ACTION_SEND).apply {
            this.type = type
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, file.name)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            clipData = ClipData.newRawUri(file.name, uri)
        }
        context.startActivity(Intent.createChooser(send, "Share ${file.name}").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    fun restore(uri: Uri) {
        val context = getApplication<Application>()
        val text = context.contentResolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) }
            ?: return
        try {
            val backup = json.decodeFromString<BackupFile>(text)
            if (backup.version != 1) {
                snack = "That backup version is not supported."
                return
            }
            if (backup.transactions.any { it.amountPaise <= 0 || it.item.isBlank() }) {
                snack = "That file has an invalid expense."
                return
            }
            persist(
                Ledger(
                    transactions = backup.transactions,
                    budgets = mergeBudgets(backup.budgets),
                    mealNotes = backup.mealNotes.filter { it.text.isNotBlank() },
                    dailyLimitPaise = backup.dailyLimitPaise?.takeIf { it > 0 },
                    viewMonth = backup.viewMonth.takeIf { Regex("""\d{4}-\d{2}""").matches(it) } ?: monthKey(),
                    recentCategories = backup.recentCategories.take(8),
                    lastPayment = backup.lastPayment,
                ),
            )
            snack = "Backup restored"
        } catch (_: Exception) {
            snack = "That file is not a Kasu backup."
        }
    }

    private fun vibrate() {
        val vibrator = getApplication<Application>().getSystemService(Vibrator::class.java) ?: return
        vibrator.vibrate(VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE))
    }
}

private fun Draft.toTransaction(id: String, createdAt: String, updatedAt: String) =
    app.kasu.logic.Transaction(
        id = id,
        item = item.trim(),
        amountPaise = amountPaise,
        category = category.trim(),
        paymentMethod = paymentMethod,
        needWant = needWant,
        refundable = refundable,
        notes = notes.trim(),
        date = date,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
