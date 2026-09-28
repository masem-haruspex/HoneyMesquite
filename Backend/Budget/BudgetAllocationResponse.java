package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BudgetAllocationResponse(
    Long id,
    Long departmentId,
    Long categoryId,
    int fiscalYear,
    String quarter,
    BigDecimal budgetedAmount,
    boolean isCurrent,
    int version,
    LocalDateTime createdAt
) {
    @JsonCreator
    public BudgetAllocationResponse {}
}
