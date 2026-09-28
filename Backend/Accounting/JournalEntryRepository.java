package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByAccountCode(String accountCode);
    List<JournalEntry> findByPeriodId(Integer periodId);
    List<JournalEntry> findByDateBetween(LocalDateTime start, LocalDateTime end);
    List<JournalEntry> findByReconciledFalse();
    long countByPeriodId(Integer periodId);

    @Query("SELECT j FROM JournalEntry j WHERE j.accountCode = :accountCode " +
           "AND j.date BETWEEN :startDate AND :endDate")
    List<JournalEntry> findByAccountAndDateRange(@Param("accountCode") String accountCode,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    default List<JournalEntry> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return findByDateBetween(start, end);
    }
}
