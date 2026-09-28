package org.mm.FinanceTracker.Metrics;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "financial_health_dashboard")
public class FinancialHealthDashboard {

    @Id
    @Column(name = "as_of_date")
    private LocalDate asOfDate;

    @Column(name = "cash_balance", precision = 19, scale = 4)
    private BigDecimal cashBalance;

    @Column(name = "receivables_count")
    private Long receivablesCount;

    @Column(name = "receivables_total", precision = 19, scale = 4)
    private BigDecimal receivablesTotal;

    @Column(name = "receivables_overdue", precision = 19, scale = 4)
    private BigDecimal receivablesOverdue;

    @Column(name = "receivables_risk_score", precision = 5, scale = 2)
    private BigDecimal receivablesRiskScore;

    @Column(name = "payables_count")
    private Long payablesCount;

    @Column(name = "payables_total", precision = 19, scale = 4)
    private BigDecimal payablesTotal;

    @Column(name = "contracts_expiring")
    private Long contractsExpiring;

    @Column(name = "active_budgets")
    private Long activeBudgets;

    @Column(name = "total_budgeted", precision = 19, scale = 4)
    private BigDecimal totalBudgeted;

    @Column(name = "total_actual_spent", precision = 19, scale = 4)
    private BigDecimal totalActualSpent;

    @Column(name = "budget_variance", precision = 19, scale = 4)
    private BigDecimal budgetVariance;

    @Column(name = "last_revenue", precision = 19, scale = 4)
    private BigDecimal lastRevenue;

    @Column(name = "last_net_income", precision = 19, scale = 4)
    private BigDecimal lastNetIncome;

    @Column(name = "last_margin", precision = 5, scale = 2)
    private BigDecimal lastMargin;

    @Column(name = "working_capital", precision = 19, scale = 4)
    private BigDecimal workingCapital;

    @Column(name = "quick_ratio", precision = 5, scale = 2)
    private BigDecimal quickRatio;

    public FinancialHealthDashboard() {}

    public FinancialHealthDashboard(LocalDate asOfDate, BigDecimal cashBalance, Long receivablesCount,
                                   BigDecimal receivablesTotal, BigDecimal receivablesOverdue,
                                   BigDecimal receivablesRiskScore, Long payablesCount,
                                   BigDecimal payablesTotal, Long contractsExpiring,
                                   Long activeBudgets, BigDecimal totalBudgeted,
                                   BigDecimal totalActualSpent, BigDecimal budgetVariance,
                                   BigDecimal lastRevenue, BigDecimal lastNetIncome,
                                   BigDecimal lastMargin, BigDecimal workingCapital,
                                   BigDecimal quickRatio) {
        this.asOfDate = asOfDate;
        this.cashBalance = cashBalance;
        this.receivablesCount = receivablesCount;
        this.receivablesTotal = receivablesTotal;
        this.receivablesOverdue = receivablesOverdue;
        this.receivablesRiskScore = receivablesRiskScore;
        this.payablesCount = payablesCount;
        this.payablesTotal = payablesTotal;
        this.contractsExpiring = contractsExpiring;
        this.activeBudgets = activeBudgets;
        this.totalBudgeted = totalBudgeted;
        this.totalActualSpent = totalActualSpent;
        this.budgetVariance = budgetVariance;
        this.lastRevenue = lastRevenue;
        this.lastNetIncome = lastNetIncome;
        this.lastMargin = lastMargin;
        this.workingCapital = workingCapital;
        this.quickRatio = quickRatio;
    }

    public LocalDate getAsOfDate() { return asOfDate; }
    public BigDecimal getCashBalance() { return cashBalance; }
    public Long getReceivablesCount() { return receivablesCount; }
    public BigDecimal getReceivablesTotal() { return receivablesTotal; }
    public BigDecimal getReceivablesOverdue() { return receivablesOverdue; }
    public BigDecimal getReceivablesRiskScore() { return receivablesRiskScore; }
    public Long getPayablesCount() { return payablesCount; }
    public BigDecimal getPayablesTotal() { return payablesTotal; }
    public Long getContractsExpiring() { return contractsExpiring; }
    public Long getActiveBudgets() { return activeBudgets; }
    public BigDecimal getTotalBudgeted() { return totalBudgeted; }
    public BigDecimal getTotalActualSpent() { return totalActualSpent; }
    public BigDecimal getBudgetVariance() { return budgetVariance; }
    public BigDecimal getLastRevenue() { return lastRevenue; }
    public BigDecimal getLastNetIncome() { return lastNetIncome; }
    public BigDecimal getLastMargin() { return lastMargin; }
    public BigDecimal getWorkingCapital() { return workingCapital; }
    public BigDecimal getQuickRatio() { return quickRatio; }

}
