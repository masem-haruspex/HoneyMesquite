package org.mm.FinanceTracker.Departments;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;

public record DepartmentPerformanceRequest(
    Long departmentId,
    LocalDate recordedDate,
    BigDecimal spend,
    BigDecimal revenue,
    BigDecimal efficiency,
    boolean isCurrent
) {
    @JsonCreator
    public DepartmentPerformanceRequest {}
}
