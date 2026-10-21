package app.kasu.data

import android.content.Context
import app.kasu.logic.BackupFile
import app.kasu.logic.Ledger
import app.kasu.logic.mergeBudgets
import app.kasu.logic.monthKey
import app.kasu.logic.seedLedger
import kotlinx.serialization.json.Json
import java.io.File

object LedgerStore {
    private const val FILE_NAME = "kasu-ledger.json"
    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        prettyPrint = true
    }

    fun load(context: Context): Ledger {
        val file = File(context.filesDir, FILE_NAME)
        if (!file.exists()) return seedLedger()
        return try {
            val backup = json.decodeFromString<BackupFile>(file.readText())
            if (backup.version != 1 || backup.transactions.any { it.amountPaise <= 0 || it.item.isBlank() }) {
                seedLedger()
            } else {
                Ledger(
                    transactions = backup.transactions,
                    budgets = mergeBudgets(backup.budgets),
                    mealNotes = backup.mealNotes,
                    dailyLimitPaise = backup.dailyLimitPaise?.takeIf { it > 0 },
                    viewMonth = backup.viewMonth.takeIf { Regex("""\d{4}-\d{2}""").matches(it) } ?: monthKey(),
                    recentCategories = backup.recentCategories.take(8),
                    lastPayment = backup.lastPayment,
                )
            }
        } catch (_: Exception) {
            file.copyTo(File(context.filesDir, "kasu-ledger.bak"), overwrite = true)
            seedLedger()
        }
    }

    fun save(context: Context, ledger: Ledger) {
        val file = File(context.filesDir, FILE_NAME)
        file.writeText(json.encodeToString(BackupFile.serializer(), backupOf(ledger)))
    }

    fun backupOf(ledger: Ledger) = BackupFile(
        transactions = ledger.transactions,
        budgets = ledger.budgets,
        mealNotes = ledger.mealNotes,
        dailyLimitPaise = ledger.dailyLimitPaise,
        viewMonth = ledger.viewMonth,
        recentCategories = ledger.recentCategories,
        lastPayment = ledger.lastPayment,
    )
}
