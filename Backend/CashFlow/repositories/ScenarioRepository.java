package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ScenarioRepository extends JpaRepository<Scenario, Long> {
    Optional<Scenario> findByName(String name);
    
    @Query("SELECT s FROM Scenario s WHERE s.probability >= :minProbability")
    List<Scenario> findByMinProbability(@Param("minProbability") BigDecimal minProbability);
}
