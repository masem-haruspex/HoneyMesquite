package org.mm.FinanceTracker.Banking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OutstandingReconciliationItemRepository extends JpaRepository<OutstandingReconciliationItem, Long> {

	@Query("SELECT o FROM OutstandingReconciliationItem o WHERE o.bankAccount = :bankAccount ORDER BY o.date")
	List<OutstandingReconciliationItem> findByBankAccount(@Param("bankAccount") String bankAccount);

	@Query("SELECT o FROM OutstandingReconciliationItem o WHERE o.source = :source")
	List<OutstandingReconciliationItem> findBySource(@Param("source") String source);

	@Query("SELECT o FROM OutstandingReconciliationItem o WHERE o.reconciled = false")
	List<OutstandingReconciliationItem> findUnreconciled();

	@Query("SELECT o FROM OutstandingReconciliationItem o WHERE o.bankAccount = :bankAccount AND o.reconciled = false")
	List<OutstandingReconciliationItem> findUnreconciledByBank(@Param("bankAccount") String bankAccount);

	@Query("SELECT o FROM OutstandingReconciliationItem o WHERE o.date BETWEEN :startDate AND :endDate")
	List<OutstandingReconciliationItem> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

	@Query("SELECT o.bankAccount, COUNT(o) FROM OutstandingReconciliationItem o WHERE o.reconciled = false GROUP BY o.bankAccount")
	List<Object[]> getUnreconciledCountByBank();

	@Query("SELECT o FROM OutstandingReconciliationItem o ORDER BY o.date")
	List<OutstandingReconciliationItem> findAllOrdered();
}
