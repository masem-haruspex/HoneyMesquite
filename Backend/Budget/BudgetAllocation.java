package org.mm.FinanceTracker.Budget;

import jakarta.persistence.*;
import org.mm.FinanceTracker.Departments.Department;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "budget_allocations")
public class BudgetAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

	@JsonIgnoreProperties("profitLossStatements")
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

	@JsonIgnoreProperties("allocations")
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "fiscal_year", nullable = false)
    private int fiscalYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "quarter", length = 2)
    private Quarter quarter;

    @Column(name = "budgeted_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal budgetedAmount;

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    // Getters and Setters
    public long getId() { return id; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public int getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(int fiscalYear) { this.fiscalYear = fiscalYear; }
    public Quarter getQuarter() { return quarter; }
    public void setQuarter(Quarter quarter) { this.quarter = quarter; }
    public BigDecimal getBudgetedAmount() { return budgetedAmount; }
    public void setBudgetedAmount(BigDecimal budgetedAmount) { this.budgetedAmount = budgetedAmount; }
    public boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(boolean current) { isCurrent = current; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Constructors
    public BudgetAllocation() {
        this.isCurrent = true;
        this.version = 1;
        this.createdAt = LocalDateTime.now();
    }
    public BudgetAllocation(
    Department department,
    Category category,
    int fiscalYear,
    Quarter quarter,
    BigDecimal budgetedAmount,
    boolean isCurrent,
    int version,
    LocalDateTime createdAt
    ){
      this.department = department;
      this.category = category;
      this.fiscalYear = fiscalYear;
      this.quarter = quarter;
      this.budgetedAmount = budgetedAmount;
      this.isCurrent = isCurrent;
      this.version = version;
      this.createdAt = createdAt;

    }
}
