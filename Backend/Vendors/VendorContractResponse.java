package org.mm.FinanceTracker.Vendors;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VendorContractResponse(
    Long id,
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
    public VendorContractResponse {}
}
