package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.FundingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface FundingEventRepository extends JpaRepository<FundingEvent, Long> {
    List<FundingEvent> findByRunwayAnalysisId(Long runwayId);
    List<FundingEvent> findByDateBetween(LocalDate start, LocalDate end);
    
    @Query("SELECT SUM(f.amount) FROM FundingEvent f WHERE f.date BETWEEN :start AND :end")
    BigDecimal sumAmountBetweenDates(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
