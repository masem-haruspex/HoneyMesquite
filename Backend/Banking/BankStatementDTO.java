package org.mm.FinanceTracker.Banking;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BankStatementDTO(
    Integer bankAccountId,
    LocalDate statementDate,
    LocalDate periodStart,
    LocalDate periodEnd,
    BigDecimal openingBalance,
    BigDecimal closingBalance,
    String statementFileUrl,
    String importedBy
) {
    @JsonCreator
    public BankStatementDTO {}
}
