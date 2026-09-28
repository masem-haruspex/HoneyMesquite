package org.mm.FinanceTracker.Accounting;

import java.io.Serializable;
import java.util.Objects;

public class GeneralLedgerBalanceId implements Serializable {
    private String accountCode;
    private Integer periodId;

    public GeneralLedgerBalanceId() {}

    public GeneralLedgerBalanceId(String accountCode, Integer periodId) {
        this.accountCode = accountCode;
        this.periodId = periodId;
    }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public Integer getPeriodId() { return periodId; }
    public void setPeriodId(Integer periodId) { this.periodId = periodId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GeneralLedgerBalanceId that = (GeneralLedgerBalanceId) o;
        return Objects.equals(accountCode, that.accountCode) &&
               Objects.equals(periodId, that.periodId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accountCode, periodId);
    }
}
