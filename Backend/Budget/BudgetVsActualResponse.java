package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;

public record BudgetVsActualResponse(
        Long allocationId,
        Long categoryId,
        String categoryName,
        BigDecimal budgetedAmount,
        BigDecimal actualAmount,
        BigDecimal variance,
        Quarter quarter,
        int fiscalYear
) {
    @JsonCreator
    public BudgetVsActualResponse {}
}
