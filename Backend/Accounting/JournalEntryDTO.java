package org.mm.FinanceTracker.Accounting;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record JournalEntryDTO(
    String description,
    BigDecimal amount,
    String type,
    String accountCode,
    BigDecimal debitAmount,
    BigDecimal creditAmount,
    String referenceNumber,
    Integer periodId,
    Integer bankAccountId
) {
    @JsonCreator
    public JournalEntryDTO {}
}
