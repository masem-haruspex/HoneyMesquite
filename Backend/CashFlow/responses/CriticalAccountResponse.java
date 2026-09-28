package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CriticalAccountResponse(
        String name,
        BigDecimal balance,
        BigDecimal minThreshold
) {
    @JsonCreator
    public CriticalAccountResponse {}
}
