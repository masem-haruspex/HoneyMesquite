package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ConfidenceDataRequest(
        @NotNull LocalDate date,
        @Positive @NotNull BigDecimal lowerBound,
        @Positive @NotNull BigDecimal upperBound,
        @Positive @NotNull BigDecimal projectedAmount,
        @DecimalMin("0.00") @DecimalMax("1.00") BigDecimal confidenceLevel
) {
    @JsonCreator
    public ConfidenceDataRequest {
        if (upperBound.compareTo(lowerBound) < 0) {
            throw new IllegalArgumentException("Upper bound must be greater than lower bound");
        }
        if (projectedAmount.compareTo(lowerBound) < 0 || projectedAmount.compareTo(upperBound) > 0) {
            throw new IllegalArgumentException("Projected amount must be between lower and upper bounds");
        }
    }
}
