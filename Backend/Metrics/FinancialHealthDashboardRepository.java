package org.mm.FinanceTracker.Metrics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialHealthDashboardRepository extends JpaRepository<FinancialHealthDashboard, LocalDate> {
    
    @Query("SELECT f FROM FinancialHealthDashboard f ORDER BY f.asOfDate DESC")
    Optional<FinancialHealthDashboard> findLatest();
    
    @Query("SELECT f FROM FinancialHealthDashboard f WHERE f.asOfDate >= :startDate AND f.asOfDate <= :endDate")
    List<FinancialHealthDashboard> findByDateRange(@Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT f FROM FinancialHealthDashboard f WHERE f.asOfDate = :date")
    Optional<FinancialHealthDashboard> findByDate(@Param("date") LocalDate date);
}
