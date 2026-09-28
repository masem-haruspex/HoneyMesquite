package org.mm.FinanceTracker.ProfitLoss;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ProfitLossResponse(
    Long id,
    Long departmentId,
    String periodName,
    LocalDate periodStart,
    LocalDate periodEnd,
    BigDecimal revenue,
    BigDecimal cogs,
    BigDecimal grossProfit,
    BigDecimal operatingExpenses,
    BigDecimal netIncome,
    BigDecimal marginPercentage,
    boolean isForecast,
    int version,
    LocalDateTime createdAt,
    List<PLLineItem> lineItems
) {
    @JsonCreator
    public ProfitLossResponse {}
}
