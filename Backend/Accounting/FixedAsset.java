package org.mm.FinanceTracker.Accounting;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fixed_assets")
public class FixedAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    private String description;
    @Column(nullable = false)
    private LocalDate purchaseDate;
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal cost;
    @Column(precision = 19, scale = 4)
    private BigDecimal salvageValue = BigDecimal.ZERO;
    @Column(nullable = false)
    private Integer usefulLifeYears;
    @Column(precision = 19, scale = 4)
    private BigDecimal accumulatedDepreciation = BigDecimal.ZERO;
    @Column(insertable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal netBookValue;
    private String status = "ACTIVE"; // ACTIVE, RETIRED, SOLD
    @Column(name = "account_code")
    private String accountCode;
    @Column(name = "retirement_date")
    private LocalDate retirementDate;
    @Column(precision = 19, scale = 4)
    private BigDecimal salePrice;
    @Column(name = "created_at")
    private LocalDate createdAt;
    @Column(name = "updated_at")
    private LocalDate updatedAt;

    public FixedAsset() {}
    public FixedAsset(String name, LocalDate purchaseDate, BigDecimal cost, Integer usefulLifeYears) {
        this.name = name;
        this.purchaseDate = purchaseDate;
        this.cost = cost;
        this.usefulLifeYears = usefulLifeYears;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }
    public BigDecimal getSalvageValue() { return salvageValue; }
    public void setSalvageValue(BigDecimal salvageValue) { this.salvageValue = salvageValue; }
    public Integer getUsefulLifeYears() { return usefulLifeYears; }
    public void setUsefulLifeYears(Integer usefulLifeYears) { this.usefulLifeYears = usefulLifeYears; }
    public BigDecimal getAccumulatedDepreciation() { return accumulatedDepreciation; }
    public void setAccumulatedDepreciation(BigDecimal accumulatedDepreciation) { this.accumulatedDepreciation = accumulatedDepreciation; }
    public BigDecimal getNetBookValue() { return netBookValue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public LocalDate getRetirementDate() { return retirementDate; }
    public void setRetirementDate(LocalDate retirementDate) { this.retirementDate = retirementDate; }
    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
    public void setNetBookValue(BigDecimal netBookValue) { this.netBookValue = netBookValue; }
}
