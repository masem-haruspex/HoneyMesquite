package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConfidenceFactorResponse(
        Long id,
        String factor,
        BigDecimal impact,
        BigDecimal confidence
) {
    @JsonCreator
    public ConfidenceFactorResponse {}
}
