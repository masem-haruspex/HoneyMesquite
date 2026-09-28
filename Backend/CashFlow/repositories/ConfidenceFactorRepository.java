package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.ConfidenceFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ConfidenceFactorRepository extends JpaRepository<ConfidenceFactor, Long> {
    List<ConfidenceFactor> findByConfidenceDataDate(LocalDate date);
    List<ConfidenceFactor> findByFactorContainingIgnoreCase(String term);

    @Query("SELECT cf FROM ConfidenceFactor cf WHERE cf.confidenceData.date = :date")
    List<ConfidenceFactor> findByConfidenceDate(@Param("date") LocalDate date);
}
