package org.mm.FinanceTracker.Banking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReconciliationSessionRepository extends JpaRepository<ReconciliationSession, Integer> {
    List<ReconciliationSession> findByBankAccountId(Integer bankAccountId);
    List<ReconciliationSession> findByStatus(String status);
    List<ReconciliationSession> findByCompletedAtIsNotNull();
}
