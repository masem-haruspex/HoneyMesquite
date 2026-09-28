package org.mm.FinanceTracker.CashFlow.requests;

import jakarta.validation.constraints.NotBlank;

public record ScenarioEdgeRequest(
        @NotBlank String sourceNodeId,
        @NotBlank String targetNodeId,
        String label,
        Boolean animated
) {
    public ScenarioEdgeRequest {
        if (sourceNodeId.equals(targetNodeId)) {
            throw new IllegalArgumentException("Source and target cannot be the same");
        }
        animated = animated != null ? animated : false;
    }
}