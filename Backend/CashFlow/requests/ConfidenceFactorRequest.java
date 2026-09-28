package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ConfidenceFactorRequest(
        @NotBlank String factor,
        @DecimalMin("-1.00") @DecimalMax("1.00") @NotNull BigDecimal impact,
        @DecimalMin("0.00") @DecimalMax("1.00") @NotNull BigDecimal confidence
) {
    @JsonCreator
    public ConfidenceFactorRequest {}
}
