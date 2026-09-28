package org.mm.FinanceTracker.Accounting;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "account_ledger")
public class AccountLedger {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "journal_entry_number", length = 50)
    private String journalEntryNumber;
    
    @Column(name = "date")
    private LocalDateTime date;
    
    @Column(name = "account_code", length = 20)
    private String accountCode;
    
    @Column(name = "account_name", length = 200)
    private String accountName;
    
    @Column(name = "description", length = 255)
    private String description;
    
    @Column(name = "debit_amount", precision = 19, scale = 4)
    private BigDecimal debitAmount;
    
    @Column(name = "credit_amount", precision = 19, scale = 4)
    private BigDecimal creditAmount;
    
    @Column(name = "reference_number", length = 100)
    private String referenceNumber;
    
    @Column(name = "entry_type", length = 10)
    private String entryType;
    
    @Column(name = "running_balance", precision = 19, scale = 4)
    private BigDecimal runningBalance;
    
    public AccountLedger() {}
    
    public AccountLedger(Long id, String journalEntryNumber, LocalDateTime date,
                        String accountCode, String accountName, String description,
                        BigDecimal debitAmount, BigDecimal creditAmount,
                        String referenceNumber, String entryType, BigDecimal runningBalance) {
        this.id = id;
        this.journalEntryNumber = journalEntryNumber;
        this.date = date;
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.description = description;
        this.debitAmount = debitAmount;
        this.creditAmount = creditAmount;
        this.referenceNumber = referenceNumber;
        this.entryType = entryType;
        this.runningBalance = runningBalance;
    }
    
    public Long getId() { return id; }
    public String getJournalEntryNumber() { return journalEntryNumber; }
    public LocalDateTime getDate() { return date; }
    public String getAccountCode() { return accountCode; }
    public String getAccountName() { return accountName; }
    public String getDescription() { return description; }
    public BigDecimal getDebitAmount() { return debitAmount; }
    public BigDecimal getCreditAmount() { return creditAmount; }
    public String getReferenceNumber() { return referenceNumber; }
    public String getEntryType() { return entryType; }
    public BigDecimal getRunningBalance() { return runningBalance; }
    
}
