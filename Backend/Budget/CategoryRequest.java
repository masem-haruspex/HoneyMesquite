package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.List;

public record CategoryRequest(
        String name,
        CategoryType type,
        List<BudgetAllocation> allocations,
		String accountCode
) {
    @JsonCreator
    public CategoryRequest {}
}
