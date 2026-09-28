package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.RiskFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RiskFactorRepository extends JpaRepository<RiskFactor, String> {
    List<RiskFactor> findByImpactGreaterThanEqual(int minImpact);
    
    @Query("SELECT r FROM RiskFactor r ORDER BY (r.likelihood * r.impact) DESC")
    List<RiskFactor> findAllOrderByRiskScore();
    
    List<RiskFactor> findByMitigationIsNull();
}
