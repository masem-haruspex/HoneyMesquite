package org.mm.FinanceTracker.Vendors;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;

public record VendorInvoiceRequest(
    Long contractId,
    LocalDate invoiceDate,
    BigDecimal amount,
    PaymentStatus paymentStatus,
    BigDecimal marketRateAtPayment
) {
    @JsonCreator
    public VendorInvoiceRequest {}
}
