package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CashFlowForecastResponse(
        Long id,
        String scenario,
        LocalDate forecastDate,
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal projectedAmount,
        BigDecimal confidenceInterval,
        BigDecimal burnRate,
        String assumptions
) {
    @JsonCreator
    public CashFlowForecastResponse {}
}
