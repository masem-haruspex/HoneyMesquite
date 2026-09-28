package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RunwayAnalysisRequest(
        @NotNull LocalDate analysisDate,
        @Positive @NotNull BigDecimal cashBalance,
        @Positive @NotNull BigDecimal burnRate,
        @Positive @NotNull BigDecimal runwayMonths
) {
    @JsonCreator
    public RunwayAnalysisRequest {}
}
