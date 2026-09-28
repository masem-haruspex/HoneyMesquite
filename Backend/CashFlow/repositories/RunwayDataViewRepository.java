package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.RunwayDataView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@Repository
public interface RunwayDataViewRepository extends JpaRepository<RunwayDataView, Long> {
    
    @Query("SELECT r FROM RunwayDataView r ORDER BY r.date DESC")
    List<RunwayDataView> findAllOrderedByDate();
    
    @Query("SELECT r FROM RunwayDataView r WHERE r.date BETWEEN :startDate AND :endDate")
    List<RunwayDataView> findByDateRange(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT r FROM RunwayDataView r WHERE r.runwayMonths < 3")
    List<RunwayDataView> findCriticalRunway();
    
    @Query("SELECT r FROM RunwayDataView r WHERE r.runwayMonths >= 3 AND r.runwayMonths < 6")
    List<RunwayDataView> findWarningRunway();
    
    @Query("SELECT r FROM RunwayDataView r WHERE r.runwayMonths >= 6")
    List<RunwayDataView> findHealthyRunway();
    
    @Query("SELECT r FROM RunwayDataView r ORDER BY r.date DESC LIMIT 1")
    RunwayDataView findLatest();
    
    @Query("SELECT AVG(r.burnRate) FROM RunwayDataView r WHERE r.date BETWEEN :startDate AND :endDate")
    BigDecimal getAverageBurnRate(@Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);
    
    @Query("SELECT MIN(r.runwayMonths) FROM RunwayDataView r WHERE r.date BETWEEN :startDate AND :endDate")
    BigDecimal getMinimumRunway(@Param("startDate") LocalDate startDate,
                                @Param("endDate") LocalDate endDate);
}
