package org.mm.FinanceTracker.Accounting;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "equity_transactions")
public class EquityTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // CAPITAL_CONTRIBUTION, OWNER_DRAW, RETAINED_EARNINGS_ADJUSTMENT
    private String description;
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;
    @Column(nullable = false)
    private LocalDate transactionDate;
    @Column(name = "equity_account_code")
    private String equityAccountCode;
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
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    public String getEquityAccountCode() { return equityAccountCode; }
    public void setEquityAccountCode(String equityAccountCode) { this.equityAccountCode = equityAccountCode; }
    public Long getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(Long journalEntryId) { this.journalEntryId = journalEntryId; }
}
