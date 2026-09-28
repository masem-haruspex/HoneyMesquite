package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.ScenarioEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ScenarioEdgeRepository extends JpaRepository<ScenarioEdge, Long> {

    List<ScenarioEdge> findBySourceNodeId(String nodeId);
    List<ScenarioEdge> findByTargetNodeId(String nodeId);
    List<ScenarioEdge> findBySourceScenarioAndSourceNodeId(Long scenarioId, String nodeId);
    List<ScenarioEdge> findByScenarioId(Long scenarioId);

    @Query("SELECT e FROM ScenarioEdge e WHERE e.source.nodeId = :nodeId")
    List<ScenarioEdge> findBySourceNodeIdCustom(@Param("nodeId") String nodeId);
}
