package org.mm.FinanceTracker.Budget;

import jakarta.persistence.*;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "budget_actual")
public class BudgetActual {

    @EmbeddedId
    private BudgetActualId id;

    @ManyToOne
    @MapsId("allocationId")
    @JoinColumn(name = "allocation_id", nullable = false)
    private BudgetAllocation allocation;

    @Column(name = "actual_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal actualAmount;

    @Column(name = "variance", insertable = false, updatable = false)
    private BigDecimal variance;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public BudgetActualId getId() { return id; }
    public void setId(BudgetActualId id) { this.id = id; }
    public BudgetAllocation getAllocation() { return allocation; }
    public void setAllocation(BudgetAllocation allocation) { this.allocation = allocation; }

    public LocalDate getRecordedDate() {
        return id != null ? id.getRecordedDate() : null;
    }

    public BigDecimal getActualAmount() { return actualAmount; }
    public void setActualAmount(BigDecimal actualAmount) { this.actualAmount = actualAmount; }
    public BigDecimal getVariance() { return variance; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public BudgetActual() {
        this.id = new BudgetActualId();
    }

    public BudgetActual(
            BudgetAllocation allocation,
            LocalDate recordedDate,
            BigDecimal actualAmount,
            String notes
    ){
        this.id = new BudgetActualId();
        this.id.setAllocationId(allocation != null ? allocation.getId() : null);
        this.id.setRecordedDate(recordedDate);
        this.allocation = allocation;
        this.actualAmount = actualAmount;
        this.notes = notes;
    }
}

@Embeddable
class BudgetActualId implements Serializable {
    @Column(name = "allocation_id") 
    private Long allocationId;

    @Column(name = "recorded_date", nullable = false) 
    private LocalDate recordedDate;

    public Long getAllocationId() { return allocationId; }
    public void setAllocationId(Long allocationId) { this.allocationId = allocationId; }
    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BudgetActualId that = (BudgetActualId) o;
        return Objects.equals(allocationId, that.allocationId) &&
                Objects.equals(recordedDate, that.recordedDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(allocationId, recordedDate);
    }
}
