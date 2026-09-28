package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccountLedgerRepository extends JpaRepository<AccountLedger, Long> {

    @Query("SELECT a FROM AccountLedger a WHERE a.accountCode = :accountCode ORDER BY a.date, a.id")
    List<AccountLedger> findByAccountCode(@Param("accountCode") String accountCode);

    @Query("SELECT a FROM AccountLedger a WHERE a.accountCode = :accountCode AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date, a.id")
    List<AccountLedger> findByAccountAndDateRange(@Param("accountCode") String accountCode,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DISTINCT a.accountCode, a.accountName FROM AccountLedger a ORDER BY a.accountCode")
    List<Object[]> findDistinctAccounts();

    @Query("SELECT a FROM AccountLedger a WHERE a.date >= :startDate AND a.date <= :endDate ORDER BY a.accountCode, a.date, a.id")
    List<AccountLedger> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM AccountLedger a ORDER BY a.date, a.id")
    List<AccountLedger> findAllOrdered();

    @Query("SELECT a FROM AccountLedger a WHERE a.accountCode = :accountCode AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date, a.id")
    List<AccountLedger> findByAccountCodeAndDateBetween(@Param("accountCode") String accountCode,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);
}
