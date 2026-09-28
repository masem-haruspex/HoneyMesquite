package org.mm.FinanceTracker.Accounting;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "accruals")
public class Accrual {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // EXPENSE or REVENUE
    @Column(nullable = false)
    private String description;
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;
    @Column(nullable = false)
    private LocalDate accrualDate;
    private LocalDate reversalDate;
    private Boolean isReversed = false;
    @Column(name = "liability_or_asset_account_code")
    private String liabilityOrAssetAccountCode;
    @Column(name = "expense_or_revenue_account_code")
    private String expenseOrRevenueAccountCode;
    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getAccrualDate() { return accrualDate; }
    public void setAccrualDate(LocalDate accrualDate) { this.accrualDate = accrualDate; }
    public LocalDate getReversalDate() { return reversalDate; }
    public void setReversalDate(LocalDate reversalDate) { this.reversalDate = reversalDate; }
    public Boolean getIsReversed() { return isReversed; }
    public void setIsReversed(Boolean isReversed) { this.isReversed = isReversed; }
    public String getLiabilityOrAssetAccountCode() { return liabilityOrAssetAccountCode; }
    public void setLiabilityOrAssetAccountCode(String liabilityOrAssetAccountCode) { this.liabilityOrAssetAccountCode = liabilityOrAssetAccountCode; }
    public String getExpenseOrRevenueAccountCode() { return expenseOrRevenueAccountCode; }
    public void setExpenseOrRevenueAccountCode(String expenseOrRevenueAccountCode) { this.expenseOrRevenueAccountCode = expenseOrRevenueAccountCode; }
    public Long getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(Long journalEntryId) { this.journalEntryId = journalEntryId; }
}
