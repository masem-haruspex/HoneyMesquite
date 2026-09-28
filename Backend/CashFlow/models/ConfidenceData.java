package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "confidence_data")
public class ConfidenceData {
    @Id
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "lower_bound", nullable = false, precision = 19, scale = 4)
    private BigDecimal lowerBound;

    @Column(name = "upper_bound", nullable = false, precision = 19, scale = 4)
    private BigDecimal upperBound;

    @Column(name = "projected_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal projectedAmount;

    @Column(name = "confidence_level", precision = 5, scale = 2)
    private BigDecimal confidenceLevel;

    @OneToMany(mappedBy = "confidenceData", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ConfidenceFactor> factors;

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getLowerBound() { return lowerBound; }
    public void setLowerBound(BigDecimal lowerBound) { this.lowerBound = lowerBound; }
    public BigDecimal getUpperBound() { return upperBound; }
    public void setUpperBound(BigDecimal upperBound) { this.upperBound = upperBound; }
    public BigDecimal getProjectedAmount() { return projectedAmount; }
    public void setProjectedAmount(BigDecimal projectedAmount) { this.projectedAmount = projectedAmount; }
    public BigDecimal getConfidenceLevel() { return confidenceLevel; }
    public void setConfidenceLevel(BigDecimal confidenceLevel) { this.confidenceLevel = confidenceLevel; }
    public List<ConfidenceFactor> getFactors() { return factors; }
    public void setFactors(List<ConfidenceFactor> factors) { this.factors = factors; }

    public ConfidenceData() {}
public ConfidenceData(LocalDate date, BigDecimal lowerBound, BigDecimal upperBound,
                     BigDecimal projectedAmount, BigDecimal confidenceLevel) {
    this.date = date;
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.projectedAmount = projectedAmount;
    this.confidenceLevel = confidenceLevel;
}

public void addFactor(ConfidenceFactor factor) {
    factors.add(factor);
    factor.setConfidenceData(this);
}
}
