package org.mm.FinanceTracker.Vendors;

import com.fasterxml.jackson.annotation.JsonCreator;

public record VendorRequest(
    String legalName,
    String industryClassification,
    String marketRateReference
) {
    @JsonCreator
    public VendorRequest {}
}
