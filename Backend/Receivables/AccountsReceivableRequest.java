package org.mm.FinanceTracker.Receivables;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AccountsReceivableRequest(
        Long clientId,
        String invoiceNumber,
        BigDecimal amount,
        LocalDate issuedDate,
        LocalDate dueDate,
        Integer daysLate,
        String status,
        CollectionStage collectionStage,
        BigDecimal probabilityOfPayment,
        LocalDateTime lastReminderDate
) {
    @JsonCreator
    public AccountsReceivableRequest {}
}
