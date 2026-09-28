package org.mm.FinanceTracker.Accounting;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "general_ledger_balances")
@IdClass(GeneralLedgerBalanceId.class)
public class GeneralLedgerBalance {

    @Id
    @Column(name = "account_code", nullable = false, length = 20)
    private String accountCode;

    @Id
    @Column(name = "period_id", nullable = false)
    private Integer periodId;

    @Column(name = "debit_total", precision = 19, scale = 4)
    private BigDecimal debitTotal = BigDecimal.ZERO;

    @Column(name = "credit_total", precision = 19, scale = 4)
    private BigDecimal creditTotal = BigDecimal.ZERO;

    @Column(name = "balance", precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public GeneralLedgerBalance() {
    }

    public GeneralLedgerBalance(String accountCode, Integer periodId) {
        this.accountCode = accountCode;
        this.periodId = periodId;
        this.updatedAt = LocalDateTime.now();
    }

    public String getAccountCode() {
        return accountCode;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public Integer getPeriodId() {
        return periodId;
    }

    public void setPeriodId(Integer periodId) {
        this.periodId = periodId;
    }

    public BigDecimal getDebitTotal() {
        return debitTotal == null ? BigDecimal.ZERO : debitTotal;
    }

    public void setDebitTotal(BigDecimal debitTotal) {
        this.debitTotal = debitTotal == null ? BigDecimal.ZERO : debitTotal;
    }

    public BigDecimal getCreditTotal() {
        return creditTotal == null ? BigDecimal.ZERO : creditTotal;
    }

    public void setCreditTotal(BigDecimal creditTotal) {
        this.creditTotal = creditTotal == null ? BigDecimal.ZERO : creditTotal;
    }

    public BigDecimal getBalance() {
        return balance == null ? BigDecimal.ZERO : balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance == null ? BigDecimal.ZERO : balance;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

	public void setId(GeneralLedgerBalanceId id) {
        if (id != null) {
            this.accountCode = id.getAccountCode();
            this.periodId = id.getPeriodId();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GeneralLedgerBalance that)) return false;
        return Objects.equals(accountCode, that.accountCode) &&
               Objects.equals(periodId, that.periodId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accountCode, periodId);
    }

    @Override
    public String toString() {
        return "GeneralLedgerBalance{" +
                "accountCode='" + accountCode + '\'' +
                ", periodId=" + periodId +
                ", debitTotal=" + debitTotal +
                ", creditTotal=" + creditTotal +
                ", balance=" + balance +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
