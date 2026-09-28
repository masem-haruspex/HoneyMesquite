package org.mm.FinanceTracker.Metrics.services;

import org.mm.FinanceTracker.Metrics.FinancialHealthDashboard;
import org.mm.FinanceTracker.Metrics.FinancialHealthDashboardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private FinancialHealthDashboardRepository dashboardRepository;

    @Transactional
    public void refreshDashboardMetrics() {
        jdbcTemplate.execute("SELECT refresh_dashboard_metrics()");
    }

    @Transactional
    public FinancialHealthDashboard getCurrentFinancialHealth() {
        refreshDashboardMetrics();
        
        return dashboardRepository.findLatest()
            .orElseThrow(() -> new RuntimeException("No financial health data available"));
    }

    public Map<String, Object> getDashboardSummary() {
        FinancialHealthDashboard dashboard = getCurrentFinancialHealth();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("asOfDate", dashboard.getAsOfDate());
        summary.put("cashBalance", dashboard.getCashBalance());
        summary.put("workingCapital", dashboard.getWorkingCapital());
        summary.put("quickRatio", dashboard.getQuickRatio());
        summary.put("lastRevenue", dashboard.getLastRevenue());
        summary.put("lastNetIncome", dashboard.getLastNetIncome());
        summary.put("lastMargin", dashboard.getLastMargin());
        
        if (dashboard.getReceivablesTotal() != null && dashboard.getReceivablesTotal().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal collectionEfficiency = BigDecimal.ONE
                .subtract(dashboard.getReceivablesOverdue().divide(dashboard.getReceivablesTotal(), 4, BigDecimal.ROUND_HALF_UP))
                .multiply(BigDecimal.valueOf(100));
            summary.put("collectionEfficiency", collectionEfficiency);
        }
        
        if (dashboard.getTotalBudgeted() != null && dashboard.getTotalBudgeted().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal budgetUtilization = dashboard.getTotalActualSpent()
                .divide(dashboard.getTotalBudgeted(), 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
            summary.put("budgetUtilization", budgetUtilization);
        }
        
        summary.put("cashStatus", getCashStatus(dashboard.getCashBalance()));
        summary.put("receivablesStatus", getReceivablesStatus(dashboard.getReceivablesOverdue(), dashboard.getReceivablesTotal()));
        summary.put("payablesStatus", getPayablesStatus(dashboard.getContractsExpiring()));
        
        return summary;
    }

    private String getCashStatus(BigDecimal cashBalance) {
        if (cashBalance == null) return "UNKNOWN";
        
        if (cashBalance.compareTo(BigDecimal.valueOf(100000)) > 0) return "HEALTHY";
        if (cashBalance.compareTo(BigDecimal.valueOf(50000)) > 0) return "ADEQUATE";
        if (cashBalance.compareTo(BigDecimal.valueOf(10000)) > 0) return "LOW";
        return "CRITICAL";
    }

    private String getReceivablesStatus(BigDecimal overdue, BigDecimal total) {
        if (overdue == null || total == null || total.compareTo(BigDecimal.ZERO) == 0) return "UNKNOWN";
        
        BigDecimal overduePercentage = overdue.divide(total, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
        
        if (overduePercentage.compareTo(BigDecimal.valueOf(10)) < 0) return "EXCELLENT";
        if (overduePercentage.compareTo(BigDecimal.valueOf(20)) < 0) return "GOOD";
        if (overduePercentage.compareTo(BigDecimal.valueOf(30)) < 0) return "FAIR";
        return "POOR";
    }

    private String getPayablesStatus(Long expiringContracts) {
        if (expiringContracts == null) return "UNKNOWN";
        
        if (expiringContracts == 0) return "GOOD";
        if (expiringContracts <= 2) return "ATTENTION";
        return "URGENT";
    }

    public Map<String, Object> getTrends(LocalDate startDate, LocalDate endDate) {
        var historicalData = dashboardRepository.findByDateRange(startDate, endDate);
        
        Map<String, Object> trends = new HashMap<>();
        
        if (historicalData.size() >= 2) {
            FinancialHealthDashboard oldest = historicalData.get(historicalData.size() - 1);
            FinancialHealthDashboard newest = historicalData.get(0);
            
            trends.put("cashTrend", calculatePercentageChange(oldest.getCashBalance(), newest.getCashBalance()));
            trends.put("workingCapitalTrend", calculatePercentageChange(oldest.getWorkingCapital(), newest.getWorkingCapital()));
            trends.put("revenueTrend", calculatePercentageChange(oldest.getLastRevenue(), newest.getLastRevenue()));
            trends.put("marginTrend", calculatePercentageChange(oldest.getLastMargin(), newest.getLastMargin()));
        }
        
        return trends;
    }

    private String calculatePercentageChange(BigDecimal oldValue, BigDecimal newValue) {
        if (oldValue == null || newValue == null || oldValue.compareTo(BigDecimal.ZERO) == 0) {
            return "N/A";
        }
        
        BigDecimal change = newValue.subtract(oldValue)
            .divide(oldValue, 4, BigDecimal.ROUND_HALF_UP)
            .multiply(BigDecimal.valueOf(100));
        
        if (change.compareTo(BigDecimal.valueOf(10)) > 0) return "STRONG_GROWTH";
        if (change.compareTo(BigDecimal.valueOf(5)) > 0) return "GROWING";
        if (change.compareTo(BigDecimal.valueOf(-5)) > 0) return "STABLE";
        if (change.compareTo(BigDecimal.valueOf(-10)) > 0) return "DECLINING";
        return "SHARP_DECLINE";
    }
}
