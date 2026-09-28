package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrialBalanceRepository extends JpaRepository<TrialBalance, String> {

    @Query("SELECT t FROM TrialBalance t ORDER BY t.code")
    List<TrialBalance> findAllOrdered();

    @Query("SELECT t FROM TrialBalance t WHERE t.type = :type ORDER BY t.code")
    List<TrialBalance> findByType(@Param("type") String type);

    @Query("SELECT SUM(t.balance) FROM TrialBalance t WHERE t.type = 'ASSET'")
    BigDecimal getTotalAssets();

    @Query("SELECT SUM(t.balance) FROM TrialBalance t WHERE t.type = 'LIABILITY'")
    BigDecimal getTotalLiabilities();

    @Query("SELECT SUM(t.balance) FROM TrialBalance t WHERE t.type = 'EQUITY'")
    BigDecimal getTotalEquity();

    @Query("SELECT SUM(t.balance) FROM TrialBalance t WHERE t.type = 'REVENUE'")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(t.balance) FROM TrialBalance t WHERE t.type = 'EXPENSE'")
    BigDecimal getTotalExpenses();

    @Query("SELECT SUM(t.totalDebits) FROM TrialBalance t")
    BigDecimal getTotalDebits();

    @Query("SELECT SUM(t.totalCredits) FROM TrialBalance t")
    BigDecimal getTotalCredits();

    @Query("SELECT t FROM TrialBalance t WHERE t.periodId = :periodId")
    Optional<TrialBalance> findByPeriodId(@Param("periodId") Integer periodId);
}
