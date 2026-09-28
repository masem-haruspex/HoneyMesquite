package org.mm.FinanceTracker.CashFlow.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.LocalDate;
import java.util.Objects;

@Embeddable
public class ForecastActualId implements java.io.Serializable {
    @Column(name = "forecast_id", insertable = true, updatable = false)
    private Long forecastId;

    @Column(name = "actual_date", insertable = true, updatable = false)
    private LocalDate actualDate;

    public ForecastActualId() {}

    public ForecastActualId(Long forecastId, LocalDate actualDate) {
        this.forecastId = forecastId;
        this.actualDate = actualDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ForecastActualId that = (ForecastActualId) o;
        return Objects.equals(forecastId, that.forecastId) &&
                Objects.equals(actualDate, that.actualDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(forecastId, actualDate);
    }

    public Long getForecastId() { return forecastId; }
    public void setForecastId(Long forecastId) { this.forecastId = forecastId; }
    public LocalDate getActualDate() { return actualDate; }
    public void setActualDate(LocalDate actualDate) { this.actualDate = actualDate; }
}