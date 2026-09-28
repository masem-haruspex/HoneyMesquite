package org.mm.FinanceTracker.Workflows;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EscalationPolicyRepository extends JpaRepository<EscalationPolicy, Long> {
    List<EscalationPolicy> findByWorkflowId(Long workflowId);
    List<EscalationPolicy> findByStepId(Long stepId);
    List<EscalationPolicy> findByWorkflowIdAndIsActiveTrue(Long workflowId);
    Optional<EscalationPolicy> findByStepIdAndIsActiveTrue(Long stepId);
}