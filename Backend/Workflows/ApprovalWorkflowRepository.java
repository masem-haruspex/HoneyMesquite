package org.mm.FinanceTracker.Workflows;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Long> {
    List<ApprovalWorkflow> findByEntityTypeAndIsActiveTrue(String entityType);
    List<ApprovalWorkflow> findByIsActiveTrue();
    Optional<ApprovalWorkflow> findByIdAndIsActiveTrue(Long id);
}