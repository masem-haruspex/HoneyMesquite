package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "runway_analysis")
public class RunwayAnalysis {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "analysis_date", nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
	private LocalDate analysisDate;

	@Column(name = "cash_balance", nullable = false, precision = 19, scale = 4)
	private BigDecimal cashBalance;

	@Column(name = "burn_rate", nullable = false, precision = 10, scale = 2)
	private BigDecimal burnRate;

	@Column(name = "runway_months", nullable = false, precision = 10, scale = 2)
	private BigDecimal runwayMonths;

	@OneToMany(mappedBy = "runwayAnalysis", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<FundingEvent> fundingEvents;

	// Getters and Setters
	public Long getId() { return id; }
	public LocalDate getAnalysisDate() { return analysisDate; }
	public void setAnalysisDate(LocalDate analysisDate) { this.analysisDate = analysisDate; }
	public BigDecimal getCashBalance() { return cashBalance; }
	public void setCashBalance(BigDecimal cashBalance) { this.cashBalance = cashBalance; }
	public BigDecimal getBurnRate() { return burnRate; }
	public void setBurnRate(BigDecimal burnRate) { this.burnRate = burnRate; }
	public BigDecimal getRunwayMonths() { return runwayMonths; }
	public void setRunwayMonths(BigDecimal runwayMonths) { this.runwayMonths = runwayMonths; }
	public List<FundingEvent> getFundingEvents() { return fundingEvents; }
	public void setFundingEvents(List<FundingEvent> fundingEvents) { this.fundingEvents = fundingEvents; }

	public RunwayAnalysis() {}
	public RunwayAnalysis(LocalDate analysisDate, BigDecimal cashBalance,
			BigDecimal burnRate, BigDecimal runwayMonths) {
		this.analysisDate = analysisDate;
		this.cashBalance = cashBalance;
		this.burnRate = burnRate;
		this.runwayMonths = runwayMonths;
	}

	public void addFundingEvent(FundingEvent event) {
		fundingEvents.add(event);
		event.setRunwayAnalysis(this);
	}
}
