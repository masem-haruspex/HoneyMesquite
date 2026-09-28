package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "critical_accounts")
public class CriticalAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @ManyToOne
    @JoinColumn(name = "event_date", referencedColumnName = "event_date", insertable = false, updatable = false)
    @JsonBackReference
    private LiquidityEvent liquidityEvent;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @Column(name = "min_threshold", nullable = false, precision = 19, scale = 4)
    private BigDecimal minThreshold;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public LiquidityEvent getLiquidityEvent() { return liquidityEvent; }
    public void setLiquidityEvent(LiquidityEvent liquidityEvent) {
        this.liquidityEvent = liquidityEvent;
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public BigDecimal getMinThreshold() { return minThreshold; }
    public void setMinThreshold(BigDecimal minThreshold) { this.minThreshold = minThreshold; }

    public CriticalAccount() {}
    public CriticalAccount(LiquidityEvent liquidityEvent, String name,
                           BigDecimal balance, BigDecimal minThreshold) {
        this.liquidityEvent = liquidityEvent;
        this.name = name;
        this.balance = balance;
        this.minThreshold = minThreshold;
    }
}