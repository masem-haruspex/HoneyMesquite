package org.mm.FinanceTracker.Workflows;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {
    Page<ApprovalRequest> findByRequesterUserIdOrderBySubmittedAtDesc(Long requesterUserId, Pageable pageable);
    
    @Query("SELECT ar FROM ApprovalRequest ar WHERE ar.currentStepId IN " +
           "(SELECT s.id FROM ApprovalStep s WHERE s.approverUserId = :approverUserId) " +
           "AND ar.status = 'PENDING' ORDER BY ar.submittedAt DESC")
    Page<ApprovalRequest> findPendingApprovalsByApproverUserId(@Param("approverUserId") Long approverUserId, Pageable pageable);
    
    List<ApprovalRequest> findByEntityTypeAndEntityId(String entityType, Long entityId);
    
    List<ApprovalRequest> findByStatusAndSubmittedAtBefore(String status, LocalDateTime submittedAt);
    
    @Query("SELECT COUNT(ar) FROM ApprovalRequest ar WHERE ar.currentStepId IN " +
           "(SELECT s.id FROM ApprovalStep s WHERE s.approverUserId = :approverUserId) " +
           "AND ar.status = 'PENDING'")
    Long countPendingApprovalsByApproverUserId(@Param("approverUserId") Long approverUserId);
}