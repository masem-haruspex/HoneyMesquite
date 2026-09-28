package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.util.Map;

public record BudgetMonthlyBreakdownResponse(
        Long allocationId,
        Long departmentId,
        Long categoryId,
        int fiscalYear,
        Quarter quarter, 
        BigDecimal totalBudget,
        String categoryName,
        Map<String, BigDecimal> monthlyAmounts
) {
    @JsonCreator
    public BudgetMonthlyBreakdownResponse {}
}
