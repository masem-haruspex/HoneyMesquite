package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FundingEventRequest(
        @NotNull LocalDate date,
        @Positive @NotNull BigDecimal amount,
        @NotBlank String name
) {
    @JsonCreator
    public FundingEventRequest {}
}
