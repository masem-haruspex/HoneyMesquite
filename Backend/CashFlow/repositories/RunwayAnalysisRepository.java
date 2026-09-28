package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.RunwayAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RunwayAnalysisRepository extends JpaRepository<RunwayAnalysis, Long> {
    Optional<RunwayAnalysis> findTopByOrderByAnalysisDateDesc();
    
    @Query("SELECT r FROM RunwayAnalysis r WHERE r.analysisDate = (SELECT MAX(r2.analysisDate) FROM RunwayAnalysis r2)")
    Optional<RunwayAnalysis> findLatest();
    
    List<RunwayAnalysis> findByAnalysisDateBetween(LocalDate start, LocalDate end);
}
