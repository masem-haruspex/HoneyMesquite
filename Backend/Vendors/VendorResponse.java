package org.mm.FinanceTracker.Vendors;

import com.fasterxml.jackson.annotation.JsonCreator;

public record VendorResponse(
    Long id,
    String legalName,
    String industryClassification,
    String marketRateReference
) {
    @JsonCreator
    public VendorResponse {}
}
