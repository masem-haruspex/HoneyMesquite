package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.CashFlowForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface CashFlowForecastRepository extends JpaRepository<CashFlowForecast, Long> {
    List<CashFlowForecast> findByPeriodStartBetween(LocalDate start, LocalDate end);
    List<CashFlowForecast> findByScenario(String scenario);
    
    @Query("SELECT f FROM CashFlowForecast f WHERE f.periodStart <= :date AND f.periodEnd >= :date")
    List<CashFlowForecast> findActiveForecasts(@Param("date") LocalDate date);
}
