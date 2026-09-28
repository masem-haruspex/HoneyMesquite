package org.mm.FinanceTracker.CashFlow.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record LiquidityEventRequest(
        @NotNull LocalDate date,
        @PositiveOrZero @NotNull BigDecimal cashIn,
        @PositiveOrZero @NotNull BigDecimal cashOut,
        List<CriticalAccountRequest> criticalAccounts,
        @NotNull BigDecimal balance
) {
    @JsonCreator
    public LiquidityEventRequest {
        if (cashIn.signum() == 0 && cashOut.signum() == 0) {
            throw new IllegalArgumentException("At least one of cashIn or cashOut must be non-zero");
        }
    }
}
