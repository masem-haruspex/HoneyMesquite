package org.mm.FinanceTracker.Banking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BankStatementRepository extends JpaRepository<BankStatement, Integer> {
    List<BankStatement> findByBankAccountId(Integer bankAccountId);
    List<BankStatement> findByStatus(String status);
    
    @Query("SELECT s FROM BankStatement s WHERE s.periodStart <= :date AND s.periodEnd >= :date")
    List<BankStatement> findStatementsByDate(LocalDate date);
    
    List<BankStatement> findByPeriodStartBetween(LocalDate start, LocalDate end);
}
