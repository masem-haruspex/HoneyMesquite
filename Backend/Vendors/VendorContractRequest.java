package org.mm.FinanceTracker.Vendors;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;

public record VendorContractRequest(
    Long vendorId,
    Long departmentId,
    String serviceDescription,
    BigDecimal contractedRate,
    BigDecimal marketComparisonRate,
    LocalDate contractStart,
    LocalDate contractEnd,
    boolean autoRenew
) {
    @JsonCreator
    public VendorContractRequest {}
}
