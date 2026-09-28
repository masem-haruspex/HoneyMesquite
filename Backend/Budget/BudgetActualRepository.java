package org.mm.FinanceTracker.Budget;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetActualRepository extends JpaRepository<BudgetActual, BudgetActualId> {
	List<BudgetActual> findByAllocationId(Long allocationId);
}