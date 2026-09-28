package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByStatus(String status);
    List<Loan> findByNextPaymentDateBetween(LocalDate startDate, LocalDate endDate);
}
