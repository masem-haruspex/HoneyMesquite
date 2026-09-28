package org.mm.FinanceTracker.Metrics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CompanyMetricsRepository extends JpaRepository<CompanyMetric, Integer> {
    List<CompanyMetric> findByMetricDate(LocalDate metricDate);
    List<CompanyMetric> findByMetricName(String metricName);
    
    @Query("SELECT cm FROM CompanyMetric cm WHERE cm.metricDate BETWEEN :startDate AND :endDate")
    List<CompanyMetric> findByDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT cm FROM CompanyMetric cm WHERE cm.sourceTable = :sourceTable AND cm.sourceId = :sourceId")
    List<CompanyMetric> findBySource(String sourceTable, Long sourceId);
}
