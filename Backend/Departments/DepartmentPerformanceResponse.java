package org.mm.FinanceTracker.Departments;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DepartmentPerformanceResponse(
    Long id,
    Long departmentId,
    LocalDate recordedDate,
    BigDecimal spend,
    BigDecimal revenue,
    BigDecimal efficiency,
    boolean isCurrent,
    LocalDateTime createdAt
) {
    @JsonCreator
    public DepartmentPerformanceResponse {}
}
