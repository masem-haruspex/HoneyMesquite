package org.mm.FinanceTracker.Workflows;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByRequestIdOrderByCreatedAt(Long requestId);
    List<Approval> findByRequestIdAndStatusOrderByCreatedAt(Long requestId, String status);
    List<Approval> findByStepIdAndStatus(Long stepId, String status);
    Optional<Approval> findByRequestIdAndApproverUserIdAndStatus(Long requestId, Long approverUserId, String status);
}