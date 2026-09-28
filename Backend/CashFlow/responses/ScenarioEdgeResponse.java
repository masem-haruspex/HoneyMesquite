package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScenarioEdgeResponse(
        String id,
        String source,
        String target,
        String label,
        Boolean animated
) {
    @JsonCreator
    public ScenarioEdgeResponse {}
}
