package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ScenarioRequest(
        @NotBlank String name,
        @DecimalMin("0.0000") @DecimalMax("1.0000") BigDecimal probability,
        @PositiveOrZero BigDecimal expectedValue
) {
    @JsonCreator
    public ScenarioRequest {
        if (probability == null && expectedValue == null) {
            throw new IllegalArgumentException("Either probability or expected value must be provided");
        }
    }
}
