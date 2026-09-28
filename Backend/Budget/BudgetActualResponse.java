package org.mm.FinanceTracker.Budget;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BudgetActualResponse(
    Long id,
    Long allocationId,
    LocalDate recordedDate,
    BigDecimal actualAmount,
    String notes,
    LocalDateTime createdAt
) {
    @JsonCreator
    public BudgetActualResponse {}
}
