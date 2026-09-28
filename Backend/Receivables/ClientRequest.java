package org.mm.FinanceTracker.Receivables;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.time.LocalDateTime;

public record ClientRequest(
    String name,
    String creditRating,
    int paymentTerms,
    LocalDateTime lastPaymentDate
) {
    @JsonCreator
    public ClientRequest {}
}
