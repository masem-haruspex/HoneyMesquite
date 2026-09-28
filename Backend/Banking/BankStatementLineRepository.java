package org.mm.FinanceTracker.Banking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BankStatementLineRepository extends JpaRepository<BankStatementLine, Integer> {
    List<BankStatementLine> findByStatementId(Integer statementId);
    List<BankStatementLine> findByIsReconciledFalse();
    
    @Query("SELECT l FROM BankStatementLine l WHERE l.statement.bankAccount.id = :bankAccountId " +
           "AND l.transactionDate BETWEEN :startDate AND :endDate")
    List<BankStatementLine> findByBankAccountAndDateRange(Integer bankAccountId, 
                                                         LocalDate startDate, 
                                                         LocalDate endDate);
    
    List<BankStatementLine> findByJournalEntryId(Long journalEntryId);
}
