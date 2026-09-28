package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScenarioResponse(
        Long id,
        String name,
        BigDecimal probability,
        BigDecimal expectedValue
) {
    @JsonCreator
    public ScenarioResponse {}
}
