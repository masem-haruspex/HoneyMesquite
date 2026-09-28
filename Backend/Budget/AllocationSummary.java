package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.math.BigDecimal;

public record AllocationSummary(
        long id,
        long departmentId,
        String departmentName,
        int fiscalYear,
        Quarter quarter,
        BigDecimal budgetedAmount,
        boolean isCurrent
) {
@JsonCreator
public AllocationSummary {}
}
