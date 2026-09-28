package org.mm.FinanceTracker.Banking;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record BankAccountDTO(
    String name,
    String bankName,
    String accountNumber,
    String routingNumber,
    String accountType,
    String currency,
    BigDecimal openingBalance
) {
    @JsonCreator
    public BankAccountDTO {}
}
