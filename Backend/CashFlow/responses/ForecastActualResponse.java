package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ForecastActualResponse(
        Long forecastId,
        LocalDate actualDate,
        BigDecimal actualAmount,
        BigDecimal variance,
        BigDecimal variancePercentage
) {
    @JsonCreator
    public ForecastActualResponse {}
}
