package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountingPeriodRepository extends JpaRepository<AccountingPeriod, Integer> {
    List<AccountingPeriod> findByStatus(String status);

    Optional<AccountingPeriod> findByPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(
        LocalDate date, LocalDate date2);

    List<AccountingPeriod> findByPeriodStartBetween(LocalDate start, LocalDate end);
}
