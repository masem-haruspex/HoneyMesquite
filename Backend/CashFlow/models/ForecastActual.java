package org.mm.FinanceTracker.CashFlow.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "forecast_actuals")
public class ForecastActual {
    @EmbeddedId
    private ForecastActualId id;

    @ManyToOne
    @MapsId("forecastId")
    @JoinColumn(name = "forecast_id", nullable = false)
    private CashFlowForecast forecast;

    @Column(name = "actual_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal actualAmount;

    @Column(name = "variance", precision = 19, scale = 4)
    private BigDecimal variance;

    @Column(name = "variance_percentage", precision = 5, scale = 2)
    private BigDecimal variancePercentage;

    // Getters and Setters
    public ForecastActualId getId() { return id; }
    public void setId(ForecastActualId id) { this.id = id; }
    public CashFlowForecast getForecast() { return forecast; }
    public void setForecast(CashFlowForecast forecast) { this.forecast = forecast; }
    public BigDecimal getActualAmount() { return actualAmount; }
    public void setActualAmount(BigDecimal actualAmount) { this.actualAmount = actualAmount; }
    public BigDecimal getVariance() { return variance; }
    public void setVariance(BigDecimal variance) { this.variance = variance; }
    public BigDecimal getVariancePercentage() { return variancePercentage; }
    public void setVariancePercentage(BigDecimal variancePercentage) { this.variancePercentage = variancePercentage; }

    public ForecastActual() {}
public ForecastActual(CashFlowForecast forecast, LocalDate actualDate, BigDecimal actualAmount) {
    this.id = new ForecastActualId(forecast.getId(), actualDate);
    this.forecast = forecast;
    this.actualAmount = actualAmount;
}
}

