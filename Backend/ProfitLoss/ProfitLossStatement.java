package org.mm.FinanceTracker.ProfitLoss;

import jakarta.persistence.*;
import org.mm.FinanceTracker.Departments.Department;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "profit_loss_statements")
public class ProfitLossStatement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

	@JsonIgnoreProperties("profitLossStatements")
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "period_name", nullable = false, length = 20)
    private String periodName;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "revenue", nullable = false, precision = 19, scale = 4)
    private BigDecimal revenue;

    @Column(name = "cogs", nullable = false, precision = 19, scale = 4)
    private BigDecimal cogs;

    @Column(name = "gross_profit", insertable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal grossProfit;

    @Column(name = "operating_expenses", nullable = false, precision = 19, scale = 4)
    private BigDecimal operatingExpenses;

    @Column(name = "net_income", insertable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal netIncome;

    @Column(name = "margin_percentage", insertable = false, updatable = false, precision = 5, scale = 2)
    private BigDecimal marginPercentage;

    @Column(name = "is_forecast", nullable = false)
    private boolean isForecast;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "created_at", insertable = false, nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

	@JsonIgnoreProperties("statement")
    @OneToMany(mappedBy = "statement", cascade = CascadeType.ALL)
    private List<PLLineItem> lineItems;

    public long getId() { return id; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public String getPeriodName() { return periodName; }
    public void setPeriodName(String periodName) { this.periodName = periodName; }
    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public BigDecimal getCogs() { return cogs; }
    public void setCogs(BigDecimal cogs) { this.cogs = cogs; }
    public BigDecimal getGrossProfit() { return grossProfit; }
    public void setGrossProfit(BigDecimal grossProfit) { this.grossProfit = grossProfit; }
    public BigDecimal getOperatingExpenses() { return operatingExpenses; }
    public void setOperatingExpenses(BigDecimal operatingExpenses) { this.operatingExpenses = operatingExpenses; }
    public BigDecimal getNetIncome() { return netIncome; }
    public void setNetIncome(BigDecimal netIncome) { this.netIncome = netIncome; }
    public BigDecimal getMarginPercentage() { return marginPercentage; }
    public void setMarginPercentage(BigDecimal marginPercentage) { this.marginPercentage = marginPercentage; }
    public boolean isForecast() { return isForecast; }
    public void setIsForecast(boolean forecast) { isForecast = forecast; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<PLLineItem> getLineItems() { return lineItems; }
    public void setLineItems(List<PLLineItem> lineItems) { this.lineItems = lineItems; }

    public ProfitLossStatement() {
        this.isForecast = false;
        this.version = 1;
        this.createdAt = LocalDateTime.now();
    }
    public ProfitLossStatement(
            Department department,
            String periodName,
            LocalDate periodStart,
            LocalDate periodEnd,
            BigDecimal revenue,
            BigDecimal cogs,
            BigDecimal grossProfit,
            BigDecimal operatingExpenses,
            BigDecimal netIncome,
            BigDecimal marginPercentage,
            boolean isForecast,
            int version,
            List<PLLineItem> lineItems
    ){
        this.department = department;
        this.periodName = periodName;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.revenue = revenue;
        this.cogs = cogs;
        this.grossProfit = grossProfit;
        this.operatingExpenses = operatingExpenses;
        this.netIncome = netIncome;
        this.marginPercentage = marginPercentage;
        this.isForecast = isForecast;
        this.version = version;
        this.lineItems = lineItems;
    }
}
