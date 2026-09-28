package org.mm.FinanceTracker.Banking;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "outstanding_reconciliation_items")
public class OutstandingReconciliationItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "bank_account", length = 100)
    private String bankAccount;
    
    @Column(name = "source", length = 10)
    private String source;
    
    @Column(name = "journal_entry_id")
    private Long journalEntryId;
    
    @Column(name = "date")
    private LocalDateTime date;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "reference_number", length = 100)
    private String referenceNumber;
    
    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;
    
    @Column(name = "reconciled")
    private Boolean reconciled;
    
    public OutstandingReconciliationItem() {}
    
    public OutstandingReconciliationItem(String bankAccount, String source,
                                        Long journalEntryId, LocalDateTime date,
                                        String description, String referenceNumber,
                                        BigDecimal amount, Boolean reconciled) {
        this.bankAccount = bankAccount;
        this.source = source;
        this.journalEntryId = journalEntryId;
        this.date = date;
        this.description = description;
        this.referenceNumber = referenceNumber;
        this.amount = amount;
        this.reconciled = reconciled;
    }
    
    public Long getId() { return id; }
    public String getBankAccount() { return bankAccount; }
    public String getSource() { return source; }
    public Long getJournalEntryId() { return journalEntryId; }
    public LocalDateTime getDate() { return date; }
    public String getDescription() { return description; }
    public String getReferenceNumber() { return referenceNumber; }
    public BigDecimal getAmount() { return amount; }
    public Boolean getReconciled() { return reconciled; }
    
}
