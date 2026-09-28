package org.mm.FinanceTracker.Receivables;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AccountsReceivableResponse(
    Client client,
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
    public AccountsReceivableResponse {}
}
