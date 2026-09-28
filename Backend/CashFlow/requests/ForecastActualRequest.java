package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ForecastActualRequest(
        @NotNull Long forecastId,
        @NotNull LocalDate actualDate,
        @Positive @NotNull BigDecimal actualAmount
) {
    @JsonCreator
    public ForecastActualRequest {}
}
