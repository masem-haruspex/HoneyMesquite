package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface GeneralLedgerBalanceRepository extends JpaRepository<GeneralLedgerBalance, GeneralLedgerBalanceId> {
    List<GeneralLedgerBalance> findByPeriodId(Integer periodId);
    List<GeneralLedgerBalance> findByAccountCode(String accountCode);

    @Query("SELECT g FROM GeneralLedgerBalance g WHERE g.periodId = :periodId " +
           "ORDER BY g.accountCode")
    List<GeneralLedgerBalance> getTrialBalance(@Param("periodId") Integer periodId);

    @Query("SELECT SUM(g.balance) FROM GeneralLedgerBalance g WHERE g.periodId = :periodId " +
           "AND g.accountCode LIKE :accountType%")
    BigDecimal getTotalBalanceByAccountType(@Param("periodId") Integer periodId, @Param("accountType") String accountType);

    Optional<GeneralLedgerBalance> findByAccountCodeAndPeriodId(String accountCode, Integer periodId);

    @Modifying
    @Transactional
    @Query("DELETE FROM GeneralLedgerBalance g WHERE g.periodId = :periodId")
    void deleteByPeriodId(@Param("periodId") Integer periodId);
}
