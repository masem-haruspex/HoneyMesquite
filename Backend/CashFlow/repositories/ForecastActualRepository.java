package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.ForecastActual;
import org.mm.FinanceTracker.CashFlow.models.ForecastActualId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ForecastActualRepository extends JpaRepository<ForecastActual, ForecastActualId> {
    List<ForecastActual> findByForecastId(Long forecastId);
    List<ForecastActual> findByIdActualDateBetween(LocalDate start, LocalDate end);
    
    @Query("SELECT fa FROM ForecastActual fa WHERE fa.forecast.id = :forecastId AND ABS(fa.variance) >= :threshold")
    List<ForecastActual> findByForecastIdWithVarianceAbove(
        @Param("forecastId") Long forecastId, 
        @Param("threshold") BigDecimal threshold);
}
