package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.ConfidenceData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ConfidenceDataRepository extends JpaRepository<ConfidenceData, LocalDate> {
    List<ConfidenceData> findByDateBetween(LocalDate start, LocalDate end);
    
    @Query("SELECT cd FROM ConfidenceData cd ORDER BY cd.date DESC LIMIT 1")
    ConfidenceData findLatest();
}
