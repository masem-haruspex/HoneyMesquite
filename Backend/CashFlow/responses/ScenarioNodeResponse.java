package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScenarioNodeResponse(
        String id,
        String type,
        String label,
        BigDecimal amount,
        BigDecimal probability,
        String impact,
        BigDecimal positionX,
        BigDecimal positionY
) {
    @JsonCreator
    public ScenarioNodeResponse {}
}
