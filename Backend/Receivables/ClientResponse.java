package org.mm.FinanceTracker.Receivables;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ClientResponse(
    Long id,
    String legalName,
    String creditRating,
    int paymentTerms,
    LocalDateTime lastPaymentDate,
    LocalDateTime createdAt
) {
    @JsonCreator
    public ClientResponse {}
}
