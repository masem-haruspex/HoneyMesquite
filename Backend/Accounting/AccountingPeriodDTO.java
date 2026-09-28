package org.mm.FinanceTracker.Accounting;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.LocalDate;

public record AccountingPeriodDTO(
    String periodName,
    LocalDate periodStart,
    LocalDate periodEnd,
    String periodType
) {
    @JsonCreator
    public AccountingPeriodDTO {}
}
