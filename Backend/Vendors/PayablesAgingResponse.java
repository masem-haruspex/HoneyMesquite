package org.mm.FinanceTracker.Vendors;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PayablesAgingResponse(
    Long invoiceId,
    Long vendorId,
    String vendorName,
    Long contractId,
    LocalDate invoiceDate,
    BigDecimal amount,
    PaymentStatus paymentStatus,
    Integer daysOutstanding,
    String agingBucket
) {
    @JsonCreator
    public PayablesAgingResponse {}
}
