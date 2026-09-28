package org.mm.FinanceTracker.Accounting;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "journal_entries")
public class JournalEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "journal_entry_number", length = 50)
    private String journalEntryNumber;

    @Column(name = "account_code", length = 20)
    private String accountCode;

    @Column(name = "debit_amount", precision = 19, scale = 4)
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Column(name = "credit_amount", precision = 19, scale = 4)
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "status", length = 20)
    private String status = "POSTED";

    @Column(name = "reconciled")
    private Boolean reconciled = false;

    @Column(name = "reconciled_date")
    private LocalDate reconciledDate;

    @Column(name = "period_id")
    private Integer periodId;

    @Column(name = "posted_by", length = 100)
    private String postedBy;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "bank_account_id")
    private Integer bankAccountId;

    @Column(name = "bank_reference", length = 100)
    private String bankReference;

    @Column(name = "receivable_id")
    private Long receivableId;

    @Column(name = "payable_id")
    private Long payableId;

    @Column(name = "loan_id")
    private Long loanId;

    @Column(name = "fixed_asset_id")
    private Long fixedAssetId;

    @Column(name = "accrual_id")
    private Long accrualId;

    @Column(name = "equity_transaction_id")
    private Long equityTransactionId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getJournalEntryNumber() { return journalEntryNumber; }
    public void setJournalEntryNumber(String journalEntryNumber) { this.journalEntryNumber = journalEntryNumber; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public BigDecimal getDebitAmount() { return debitAmount; }
    public void setDebitAmount(BigDecimal debitAmount) { this.debitAmount = debitAmount; }

    public BigDecimal getCreditAmount() { return creditAmount; }
    public void setCreditAmount(BigDecimal creditAmount) { this.creditAmount = creditAmount; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getReconciled() { return reconciled; }
    public void setReconciled(Boolean reconciled) { this.reconciled = reconciled; }

    public LocalDate getReconciledDate() { return reconciledDate; }
    public void setReconciledDate(LocalDate reconciledDate) { this.reconciledDate = reconciledDate; }

    public Integer getPeriodId() { return periodId; }
    public void setPeriodId(Integer periodId) { this.periodId = periodId; }

    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public Integer getBankAccountId() { return bankAccountId; }
    public void setBankAccountId(Integer bankAccountId) { this.bankAccountId = bankAccountId; }

    public String getBankReference() { return bankReference; }
    public void setBankReference(String bankReference) { this.bankReference = bankReference; }

    public Long getReceivableId() { return receivableId; }
    public void setReceivableId(Long receivableId) { this.receivableId = receivableId; }

    public Long getPayableId() { return payableId; }
    public void setPayableId(Long payableId) { this.payableId = payableId; }

    public Long getLoanId() { return loanId; }
    public void setLoanId(Long loanId) { this.loanId = loanId; }

    public Long getFixedAssetId() { return fixedAssetId; }
    public void setFixedAssetId(Long fixedAssetId) { this.fixedAssetId = fixedAssetId; }

    public Long getAccrualId() { return accrualId; }
    public void setAccrualId(Long accrualId) { this.accrualId = accrualId; }

    public Long getEquityTransactionId() { return equityTransactionId; }
    public void setEquityTransactionId(Long equityTransactionId) { this.equityTransactionId = equityTransactionId; }

    public JournalEntry() {
        this.date = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
