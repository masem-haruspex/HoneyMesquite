package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.mm.FinanceTracker.Departments.Department;

import java.math.BigDecimal;

public record BudgetAllocationRequest(
    Department department,
    Category category,
    int fiscalYear,
    Quarter quarter,
    BigDecimal budgetedAmount,
    boolean isCurrent,
    int version
) {
    @JsonCreator
    public BudgetAllocationRequest {}
}
