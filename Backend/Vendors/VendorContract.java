package org.mm.FinanceTracker.Vendors;

import jakarta.persistence.*;
import org.mm.FinanceTracker.Departments.Department;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "vendor_contracts")
public class VendorContract {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne
	@JoinColumn(name = "vendor_id", nullable = false)
	private Vendor vendor;

	@ManyToOne
	@JoinColumn(name = "department_id")
	private Department department;

	@Column(name = "service_description", nullable = false, columnDefinition = "TEXT")
	private String serviceDescription;

	@Column(name = "contracted_rate", nullable = false, precision = 19, scale = 4)
	private BigDecimal contractedRate;

	@Column(name = "market_comparison_rate", precision = 19, scale = 4)
	private BigDecimal marketComparisonRate;

	@Column(name = "contract_start", nullable = false)
	private LocalDate contractStart;

	@Column(name = "contract_end", nullable = false)
	private LocalDate contractEnd;

	@Column(name = "auto_renew", nullable = false)
	private boolean autoRenew;

	@Column(name = "payment_terms", length = 50)
	private String paymentTerms;

	@Column(name = "is_active", nullable = false)
	private boolean isActive;

	@Column(
	name = "variance_percentage",
	insertable = false,
	updatable = false,
	columnDefinition = "NUMERIC(5,2)"
	)
		private Double variancePercentage;
	public Double getVariancePercentage() { return variancePercentage; }

	// Getters and Setters
	public long getId() { return id; }
	public Vendor getVendor() { return vendor; }
	public void setVendor(Vendor vendor) { this.vendor = vendor; }
	public Department getDepartment() { return department; }
	public void setDepartment(Department department) { this.department = department; }
	public String getServiceDescription() { return serviceDescription; }
	public void setServiceDescription(String serviceDescription) { this.serviceDescription = serviceDescription; }
	public BigDecimal getContractedRate() { return contractedRate; }
	public void setContractedRate(BigDecimal contractedRate) { this.contractedRate = contractedRate; }
	public BigDecimal getMarketComparisonRate() { return marketComparisonRate; }
	public void setMarketComparisonRate(BigDecimal marketComparisonRate) { this.marketComparisonRate = marketComparisonRate; }
	public LocalDate getContractStart() { return contractStart; }
	public void setContractStart(LocalDate contractStart) { this.contractStart = contractStart; }
	public LocalDate getContractEnd() { return contractEnd; }
	public void setContractEnd(LocalDate contractEnd) { this.contractEnd = contractEnd; }
	public boolean getAutoRenew() { return autoRenew; }
	public void setAutoRenew(boolean autoRenew) { this.autoRenew = autoRenew; }
	public String getPaymentTerms() { return paymentTerms; }
	public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
	public boolean getIsActive() { return isActive; }
	public void setIsActive(boolean active) { this.isActive = active; }
	public boolean isActive() { return isActive; }
	public void setActive(boolean active) { isActive = active; }

	// Constructors
	public VendorContract() {
		this.autoRenew = false;
		this.isActive = true;
	}
}
