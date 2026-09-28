package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.time.LocalDateTime;
import java.util.List;

public record CategoryResponse (
        long id,
        String name,
        CategoryType type,
        List<AllocationSummary> allocations,
        LocalDateTime createdAt,
		String accountCode
) {
    @JsonCreator
    public CategoryResponse {}
}
