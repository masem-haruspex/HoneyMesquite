package org.mm.FinanceTracker.CashFlow.models;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "runway_data_view")
public class RunwayDataView {
    
    @Id
    @Column(name = "id")
    private Long id;
    
    @Column(name = "date")
    private LocalDate date;
    
    @Column(name = "cash_balance", precision = 19, scale = 4)
    private BigDecimal cashBalance;
    
    @Column(name = "burn_rate", precision = 10, scale = 2)
    private BigDecimal burnRate;
    
    @Column(name = "runway_months", precision = 10, scale = 2)
    private BigDecimal runwayMonths;
    
    @Column(name = "funding_events", columnDefinition = "JSONB")
    @JsonProperty("funding_events")
    private String fundingEventsJson;
    
    public RunwayDataView() {}
    
    public RunwayDataView(Long id, LocalDate date, BigDecimal cashBalance,
                         BigDecimal burnRate, BigDecimal runwayMonths, String fundingEventsJson) {
        this.id = id;
        this.date = date;
        this.cashBalance = cashBalance;
        this.burnRate = burnRate;
        this.runwayMonths = runwayMonths;
        this.fundingEventsJson = fundingEventsJson;
    }
    
    public Long getId() { return id; }
    public LocalDate getDate() { return date; }
    public BigDecimal getCashBalance() { return cashBalance; }
    public BigDecimal getBurnRate() { return burnRate; }
    public BigDecimal getRunwayMonths() { return runwayMonths; }
    public String getFundingEventsJson() { return fundingEventsJson; }
    
}
