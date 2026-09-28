package org.mm.FinanceTracker.CashFlow.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "cash_flow_forecasts")
public class CashFlowForecast {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "scenario", nullable = false, columnDefinition = "forecast_scenario")
    private ForecastScenario scenario;

    @Column(name = "forecast_date", nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate forecastDate;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "projected_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal projectedAmount;

    @Column(name = "confidence_interval", precision = 5, scale = 2)
    private BigDecimal confidenceInterval;

    @Column(name = "burn_rate", precision = 10, scale = 2)
    private BigDecimal burnRate;

    @Column(name = "assumptions", columnDefinition = "TEXT")
    private String assumptions;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public ForecastScenario getScenario() { return scenario; }
    public void setScenario(ForecastScenario scenario) { this.scenario = scenario; }
    public LocalDate getForecastDate() { return forecastDate; }
    public void setForecastDate(LocalDate forecastDate) { this.forecastDate = forecastDate; }
    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }
    public BigDecimal getProjectedAmount() { return projectedAmount; }
    public void setProjectedAmount(BigDecimal projectedAmount) { this.projectedAmount = projectedAmount; }
    public BigDecimal getConfidenceInterval() { return confidenceInterval; }
    public void setConfidenceInterval(BigDecimal confidenceInterval) { this.confidenceInterval = confidenceInterval; }
    public BigDecimal getBurnRate() { return burnRate; }
    public void setBurnRate(BigDecimal burnRate) { this.burnRate = burnRate; }
    public String getAssumptions() { return assumptions; }
    public void setAssumptions(String assumptions) { this.assumptions = assumptions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public CashFlowForecast() {}
public CashFlowForecast(ForecastScenario scenario, LocalDate periodStart, LocalDate periodEnd,
                       BigDecimal projectedAmount, BigDecimal confidenceInterval, String assumptions) {
    this.scenario = scenario;
    this.forecastDate = LocalDate.now();
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.projectedAmount = projectedAmount;
    this.confidenceInterval = confidenceInterval;
    this.assumptions = assumptions;
}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}
