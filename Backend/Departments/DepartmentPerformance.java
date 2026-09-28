package org.mm.FinanceTracker.Departments;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "department_performance_history")
public class DepartmentPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(name = "spend", nullable = false, precision = 19, scale = 4)
    private BigDecimal spend;

    @Column(name = "revenue", nullable = false, precision = 19, scale = 4)
    private BigDecimal revenue;

    @Column(name = "efficiency", nullable = false, precision = 5, scale = 2)
    private BigDecimal efficiency;

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    // Getters and Setters
    public long getId() { return id; }
	public void setId(long id) { this.id = id; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }
    public BigDecimal getSpend() { return spend; }
    public void setSpend(BigDecimal spend) { this.spend = spend; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public BigDecimal getEfficiency() { return efficiency; }
    public void setEfficiency(BigDecimal efficiency) { this.efficiency = efficiency; }
    public boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(boolean current) { isCurrent = current; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Constructors
    public DepartmentPerformance() {}
    public DepartmentPerformance(Department department, LocalDate recordedDate, 
                               BigDecimal spend, BigDecimal revenue, 
                               BigDecimal efficiency, boolean isCurrent) {
        this.department = department;
        this.recordedDate = recordedDate;
        this.spend = spend;
        this.revenue = revenue;
        this.efficiency = efficiency;
        this.isCurrent = isCurrent;
        this.createdAt = LocalDateTime.now();
    }
}
