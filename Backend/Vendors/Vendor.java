package org.mm.FinanceTracker.Vendors;

import jakarta.persistence.*;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "legal_name", nullable = false, length = 255)
    private String legalName;

    @Column(name = "industry_classification", length = 50)
    private String industryClassification;

    @Column(name = "market_rate_reference", length = 100)
    private String marketRateReference;

    // Getters and Setters
    public long getId() { return id; }
    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }
    public String getIndustryClassification() { return industryClassification; }
    public void setIndustryClassification(String industryClassification) { this.industryClassification = industryClassification; }
    public String getMarketRateReference() { return marketRateReference; }
    public void setMarketRateReference(String marketRateReference) { this.marketRateReference = marketRateReference; }

    // Constructors
    public Vendor() {}
    public Vendor(
            String legalName,
            String industryClassification,
            String marketRateReference
    ) {
        this.legalName = legalName;
        this.industryClassification = industryClassification;
        this.marketRateReference = marketRateReference;
    }
}
