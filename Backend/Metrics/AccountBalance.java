package org.mm.FinanceTracker.Metrics;

import java.math.BigDecimal;

public record AccountBalance(
    String code,
    String name,
    BigDecimal balance
) {}
