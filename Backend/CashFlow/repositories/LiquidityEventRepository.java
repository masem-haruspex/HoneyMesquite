package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.LiquidityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LiquidityEventRepository extends JpaRepository<LiquidityEvent, LocalDate> {
    List<LiquidityEvent> findByDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT e FROM LiquidityEvent e ORDER BY e.date DESC LIMIT 1")
    Optional<LiquidityEvent> findLatest();

    @Query("SELECT COALESCE(MAX(e.balance), 0) FROM LiquidityEvent e WHERE e.date < :date")
    Optional<BigDecimal> findBalanceBeforeDate(@Param("date") LocalDate date);

    List<LiquidityEvent> findByDateGreaterThanEqualOrderByDateAsc(LocalDate date);

    Optional<LiquidityEvent> findTopByOrderByDateDesc();
}
