package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LiquidityEventResponse(
        LocalDate date,
        BigDecimal cashIn,
        BigDecimal cashOut,
        BigDecimal netFlow,
        BigDecimal balance
) {
    @JsonCreator
    public LiquidityEventResponse {}
}
