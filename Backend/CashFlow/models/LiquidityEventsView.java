package org.mm.FinanceTracker.CashFlow.models;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "liquidity_events_view")
public class LiquidityEventsView {
    
    @Id
    @Column(name = "date")
    private LocalDate date;
    
    @Column(name = "cash_in", precision = 19, scale = 4)
    private BigDecimal cashIn;
    
    @Column(name = "cash_out", precision = 19, scale = 4)
    private BigDecimal cashOut;
    
    @Column(name = "net_flow", precision = 19, scale = 4)
    private BigDecimal netFlow;
    
    @Column(name = "balance", precision = 19, scale = 4)
    private BigDecimal balance;
    
    @Column(name = "critical_accounts", columnDefinition = "JSONB")
    @JsonProperty("critical_accounts")
    private String criticalAccountsJson;
    
    public LiquidityEventsView() {}
    
    public LiquidityEventsView(LocalDate date, BigDecimal cashIn, BigDecimal cashOut,
                              BigDecimal netFlow, BigDecimal balance, String criticalAccountsJson) {
        this.date = date;
        this.cashIn = cashIn;
        this.cashOut = cashOut;
        this.netFlow = netFlow;
        this.balance = balance;
        this.criticalAccountsJson = criticalAccountsJson;
    }
    
    public LocalDate getDate() { return date; }
    public BigDecimal getCashIn() { return cashIn; }
    public BigDecimal getCashOut() { return cashOut; }
    public BigDecimal getNetFlow() { return netFlow; }
    public BigDecimal getBalance() { return balance; }
    public String getCriticalAccountsJson() { return criticalAccountsJson; }
    
}
