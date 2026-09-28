package org.mm.FinanceTracker.Accounting;

import com.fasterxml.jackson.annotation.JsonCreator;

public record AccountDTO(
    String code,
    String name,
    String type,
    String parentCode,
    String normalBalance,
    Boolean isActive
) {
    @JsonCreator
    public AccountDTO {}
}
