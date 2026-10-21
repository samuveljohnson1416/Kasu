package app.kasu

import app.kasu.logic.formatInr
import app.kasu.logic.overallTotals
import app.kasu.logic.seedLedger
import org.junit.Assert.assertEquals
import org.junit.Test

class LedgerTest {
    @Test
    fun startsEmpty() {
        val ledger = seedLedger()
        assertEquals(0, ledger.transactions.size)
        assertEquals(0, ledger.mealNotes.size)
        assertEquals(0L, overallTotals(ledger.transactions).outflowPaise)
        assertEquals("₹0.00", formatInr(0))
    }
}
