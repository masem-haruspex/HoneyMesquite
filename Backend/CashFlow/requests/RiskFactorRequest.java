package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;
import org.mm.FinanceTracker.CashFlow.models.RiskFactor;

public record RiskFactorRequest(
        @NotBlank @Length(max = 36) String id,
        @NotBlank @Length(max = 100) String name,
        @Min(1) @Max(5) Integer likelihood,
        @Min(1) @Max(5) Integer impact,
        @Min(1) @Max(5) Integer velocity,
        @Length(max = 500) String mitigation
) {
    @JsonCreator
    public RiskFactorRequest {
        if (likelihood == null || impact == null || velocity == null) {
            throw new IllegalArgumentException("Likelihood, impact and velocity must all be provided");
        }
    }

    public RiskFactor toEntity() {
        return new RiskFactor(
                id,
                name,
                likelihood.shortValue(),
                impact.shortValue(),
                velocity.shortValue(),
                mitigation
        );
    }
}
