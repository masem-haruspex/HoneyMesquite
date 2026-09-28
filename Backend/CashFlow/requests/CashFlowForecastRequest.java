package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CashFlowForecastRequest(
        @NotBlank String scenario,
        @NotNull LocalDate periodStart,
        @NotNull LocalDate periodEnd,
        @Positive @NotNull BigDecimal projectedAmount,
        @DecimalMin("50.00") @DecimalMax("100.00") BigDecimal confidenceInterval,
        String assumptions
) {
    @JsonCreator
    public CashFlowForecastRequest {
        if (periodEnd.isBefore(periodStart)) {
            throw new IllegalArgumentException("Period end must be after period start");
        }
    }
}
