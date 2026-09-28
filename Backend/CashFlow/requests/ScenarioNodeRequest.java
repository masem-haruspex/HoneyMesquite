package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ScenarioNodeRequest(
        @NotBlank String nodeId,
        @Pattern(regexp = "input|output|default") String type,
        @NotBlank String label,
        @PositiveOrZero BigDecimal amount,
        @DecimalMin("0.0000") @DecimalMax("1.0000") BigDecimal probability,
        @Pattern(regexp = "positive|negative|neutral") String impact,
        @NotNull BigDecimal positionX,
        @NotNull BigDecimal positionY
) {
    @JsonCreator
    public ScenarioNodeRequest {
        if (type == null) {
            throw new IllegalArgumentException("Node type must be specified");
        }
    }
}
