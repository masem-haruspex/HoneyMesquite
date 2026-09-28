package org.mm.FinanceTracker.Banking;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reconciliation_sessions")
public class ReconciliationSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "bank_account_id")
    private BankAccount bankAccount;
    
    @ManyToOne
    @JoinColumn(name = "statement_id")
    private BankStatement statement;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "started_by", length = 100)
    private String startedBy;
    
    @Column(name = "opening_book_balance", precision = 19, scale = 4)
    private BigDecimal openingBookBalance;
    
    @Column(name = "closing_book_balance", precision = 19, scale = 4)
    private BigDecimal closingBookBalance;
    
    @Column(name = "statement_balance", precision = 19, scale = 4)
    private BigDecimal statementBalance;
    
    @Column(name = "reconciled_balance", precision = 19, scale = 4)
    private BigDecimal reconciledBalance;
    
    @Column(name = "outstanding_deposits", precision = 19, scale = 4)
    private BigDecimal outstandingDeposits = BigDecimal.ZERO;
    
    @Column(name = "outstanding_withdrawals", precision = 19, scale = 4)
    private BigDecimal outstandingWithdrawals = BigDecimal.ZERO;
    
    @Column(name = "status", length = 20)
    private String status = "IN_PROGRESS";
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public BankAccount getBankAccount() { return bankAccount; }
    public void setBankAccount(BankAccount bankAccount) { this.bankAccount = bankAccount; }
    
    public BankStatement getStatement() { return statement; }
    public void setStatement(BankStatement statement) { this.statement = statement; }
    
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public String getStartedBy() { return startedBy; }
    public void setStartedBy(String startedBy) { this.startedBy = startedBy; }
    
    public BigDecimal getOpeningBookBalance() { return openingBookBalance; }
    public void setOpeningBookBalance(BigDecimal openingBookBalance) { this.openingBookBalance = openingBookBalance; }
    
    public BigDecimal getClosingBookBalance() { return closingBookBalance; }
    public void setClosingBookBalance(BigDecimal closingBookBalance) { this.closingBookBalance = closingBookBalance; }
    
    public BigDecimal getStatementBalance() { return statementBalance; }
    public void setStatementBalance(BigDecimal statementBalance) { this.statementBalance = statementBalance; }
    
    public BigDecimal getReconciledBalance() { return reconciledBalance; }
    public void setReconciledBalance(BigDecimal reconciledBalance) { this.reconciledBalance = reconciledBalance; }
    
    public BigDecimal getOutstandingDeposits() { return outstandingDeposits; }
    public void setOutstandingDeposits(BigDecimal outstandingDeposits) { this.outstandingDeposits = outstandingDeposits; }
    
    public BigDecimal getOutstandingWithdrawals() { return outstandingWithdrawals; }
    public void setOutstandingWithdrawals(BigDecimal outstandingWithdrawals) { this.outstandingWithdrawals = outstandingWithdrawals; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public ReconciliationSession() {
        this.startedAt = LocalDateTime.now();
    }
}
