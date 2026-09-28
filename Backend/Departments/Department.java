package org.mm.FinanceTracker.Departments;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.mm.FinanceTracker.Budget.BudgetAllocation;
import org.mm.FinanceTracker.ProfitLoss.ProfitLossStatement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;

    @Column(name = "code", length = 20, unique = true)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "headcount", nullable = false)
    private int headcount;

    @Column(name = "current_efficiency", precision = 5, scale = 2)
    private BigDecimal currentEfficiency;

    @Column(name = "current_budget", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentBudget;

    @Column(name = "fiscal_year")
    private int fiscalYear;

    @Column(name = "latitude", precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "budget_owner_id")
    private Long budgetOwnerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private org.mm.FinanceTracker.Users.Organization organization;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @JsonIgnoreProperties("department")
    @OneToMany(mappedBy = "department")
    private List<ProfitLossStatement> profitLossStatements;

    @JsonIgnoreProperties("department")
    @OneToMany(mappedBy = "department")
    private List<BudgetAllocation> allocations;

    public Department() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Department(String name, int headcount, BigDecimal currentEfficiency,
                      BigDecimal currentBudget, int fiscalYear,
                      BigDecimal latitude, BigDecimal longitude) {
        this();
        this.name = name;
        this.headcount = headcount;
        this.currentEfficiency = currentEfficiency;
        this.currentBudget = currentBudget;
        this.fiscalYear = fiscalYear;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getHeadcount() { return headcount; }
    public void setHeadcount(int headcount) { this.headcount = headcount; }
    public BigDecimal getCurrentEfficiency() { return currentEfficiency; }
    public void setCurrentEfficiency(BigDecimal e) { this.currentEfficiency = e; }
    public BigDecimal getCurrentBudget() { return currentBudget; }
    public void setCurrentBudget(BigDecimal b) { this.currentBudget = b; }
    public int getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(int fiscalYear) { this.fiscalYear = fiscalYear; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Long getBudgetOwnerId() { return budgetOwnerId; }
    public void setBudgetOwnerId(Long id) { this.budgetOwnerId = id; }
    public org.mm.FinanceTracker.Users.Organization getOrganization() { return organization; }
    public void setOrganization(org.mm.FinanceTracker.Users.Organization o) { this.organization = o; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }
    public List<ProfitLossStatement> getProfitLossStatements() { return profitLossStatements; }
    public void setProfitLossStatements(List<ProfitLossStatement> l) { this.profitLossStatements = l; }
    public List<BudgetAllocation> getAllocations() { return allocations; }
    public void setAllocations(List<BudgetAllocation> l) { this.allocations = l; }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
