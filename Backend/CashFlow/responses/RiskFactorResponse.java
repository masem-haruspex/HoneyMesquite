package org.mm.FinanceTracker.CashFlow.responses;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.mm.FinanceTracker.CashFlow.models.RiskFactor;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record RiskFactorResponse(
        String id,
        String name,
        Integer likelihood,
        Integer impact,
        Integer velocity,
        String mitigation,
        Integer riskScore
) {
    @JsonCreator
    public RiskFactorResponse {}

    public static RiskFactorResponse fromEntity(RiskFactor entity) {
        return new RiskFactorResponse(
                entity.getId(),
                entity.getName(),
                entity.getLikelihood() != null ? entity.getLikelihood().intValue() : null,
                entity.getImpact() != null ? entity.getImpact().intValue() : null,
                entity.getVelocity() != null ? entity.getVelocity().intValue() : null,
                entity.getMitigation(),
                entity.calculateRiskScore() != null ? entity.calculateRiskScore().intValue() : null
        );
    }
}
