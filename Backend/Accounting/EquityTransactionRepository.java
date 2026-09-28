package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EquityTransactionRepository extends JpaRepository<EquityTransaction, Long> {}
