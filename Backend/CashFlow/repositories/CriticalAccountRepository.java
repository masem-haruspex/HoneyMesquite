package org.mm.FinanceTracker.CashFlow.repositories;

import org.mm.FinanceTracker.CashFlow.models.CriticalAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface CriticalAccountRepository extends JpaRepository<CriticalAccount, Long> {

    List<CriticalAccount> findByLiquidityEventDate(LocalDate date);

    void deleteByLiquidityEventDate(LocalDate date);

    @Query("SELECT c FROM CriticalAccount c WHERE c.balance < c.minThreshold")
    List<CriticalAccount> findBelowThreshold();
}
