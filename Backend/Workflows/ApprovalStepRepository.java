package org.mm.FinanceTracker.Workflows;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {
    List<ApprovalStep> findByWorkflowIdOrderByStepOrder(Long workflowId);
    List<ApprovalStep> findByWorkflowIdAndIsActiveTrueOrderByStepOrder(Long workflowId);
    Optional<ApprovalStep> findByIdAndIsActiveTrue(Long id);
}