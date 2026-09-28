package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.ScenarioNode;
import org.mm.FinanceTracker.CashFlow.models.ScenarioNodeId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ScenarioNodeRepository extends JpaRepository<ScenarioNode, ScenarioNodeId> {
    List<ScenarioNode> findByScenario(Long scenarioId);
    Optional<ScenarioNode> findByScenarioAndNodeId(Long scenarioId, String nodeId);
    boolean existsByScenarioAndNodeId(Long scenarioId, String nodeId);
}