package org.mm.FinanceTracker.Departments;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record DepartmentResponse(
        String name,
        int headcount,
        BigDecimal currentEfficiency,
        BigDecimal currentBudget,
        int fiscalYear,
        BigDecimal latitude,
        BigDecimal longitude
) {
    @JsonCreator
    public DepartmentResponse {}
}