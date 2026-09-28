package org.mm.FinanceTracker.Receivables;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountsReceivableRepository extends JpaRepository<AccountsReceivable, Long> {
    List<AccountsReceivable> findByStatusNot(String paid);
}