package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CriticalAccountRequest(
        @NotBlank String name,
        @PositiveOrZero @NotNull BigDecimal balance,
        @PositiveOrZero @NotNull BigDecimal minThreshold
) {
    @JsonCreator
    public CriticalAccountRequest {
        if (balance.compareTo(minThreshold) < 0) {
            throw new IllegalArgumentException("Balance cannot be below minimum threshold");
        }
    }
}
