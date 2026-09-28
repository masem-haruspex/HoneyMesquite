package org.mm.FinanceTracker.Metrics;

import java.math.BigDecimal;
import java.util.List;

public record LiquidityDetailResponse(
    List<AccountBalance> currentAssets,
    List<AccountBalance> currentLiabilities
) {}
