package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetActualRequest(
    Long allocationId,
    LocalDate recordedDate,
    BigDecimal actualAmount,
    BigDecimal variance,
    String notes
) {
    @JsonCreator
    public BudgetActualRequest {}
}
