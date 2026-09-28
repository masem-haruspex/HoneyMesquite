package org.mm.FinanceTracker.Banking;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bank_statement_lines")
public class BankStatementLine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "statement_id")
    private BankStatement statement;
    
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;
    
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;
    
    @Column(name = "balance", precision = 19, scale = 4)
    private BigDecimal balance;
    
    @Column(name = "reference", length = 100)
    private String reference;
    
    @Column(name = "transaction_type", length = 50)
    private String transactionType;
    
    @Column(name = "is_reconciled")
    private Boolean isReconciled = false;
    
    @Column(name = "journal_entry_id")
    private Long journalEntryId;
    
    @Column(name = "match_confidence", precision = 5, scale = 2)
    private BigDecimal matchConfidence = BigDecimal.ZERO;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public BankStatement getStatement() { return statement; }
    public void setStatement(BankStatement statement) { this.statement = statement; }
    
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    
    public Boolean getIsReconciled() { return isReconciled; }
    public void setIsReconciled(Boolean isReconciled) { this.isReconciled = isReconciled; }
    
    public Long getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(Long journalEntryId) { this.journalEntryId = journalEntryId; }
    
    public BigDecimal getMatchConfidence() { return matchConfidence; }
    public void setMatchConfidence(BigDecimal matchConfidence) { this.matchConfidence = matchConfidence; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
