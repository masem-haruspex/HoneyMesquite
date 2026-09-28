package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.LiquidityEventsView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface LiquidityEventsViewRepository extends JpaRepository<LiquidityEventsView, LocalDate> {
    
    @Query("SELECT l FROM LiquidityEventsView l ORDER BY l.date DESC")
    List<LiquidityEventsView> findAllOrderedByDate();
    
    @Query("SELECT l FROM LiquidityEventsView l WHERE l.date BETWEEN :startDate AND :endDate ORDER BY l.date")
    List<LiquidityEventsView> findByDateRange(@Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);
    
    @Query("SELECT l FROM LiquidityEventsView l WHERE l.netFlow < 0")
    List<LiquidityEventsView> findNegativeNetFlow();
    
    @Query("SELECT SUM(l.cashIn) FROM LiquidityEventsView l WHERE l.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCashIn(@Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(l.cashOut) FROM LiquidityEventsView l WHERE l.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCashOut(@Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate);
    
    @Query("SELECT l FROM LiquidityEventsView l ORDER BY l.date DESC LIMIT 1")
    LiquidityEventsView findLatest();
}
