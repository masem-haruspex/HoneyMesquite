package org.mm.FinanceTracker.Banking;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.math.BigDecimal;

public record ReconciliationSessionDTO(
    Integer bankAccountId,
    Integer statementId,
    String startedBy,
    BigDecimal openingBookBalance,
    BigDecimal statementBalance
) {
    @JsonCreator
    public ReconciliationSessionDTO {}
}
