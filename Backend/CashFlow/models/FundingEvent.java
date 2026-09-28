package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "funding_events")
public class FundingEvent {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "runway_id", nullable = false)
	@JsonBackReference
	private RunwayAnalysis runwayAnalysis;

	@Column(name = "date", nullable = false)
	private LocalDate date;

	@Column(name = "amount", nullable = false, precision = 19, scale = 4)
	private BigDecimal amount;

	@Column(name = "name", nullable = false, length = 100)
	private String name;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public RunwayAnalysis getRunwayAnalysis() { return runwayAnalysis; }
	public void setRunwayAnalysis(RunwayAnalysis runwayAnalysis) { this.runwayAnalysis = runwayAnalysis; }
	public LocalDate getDate() { return date; }
	public void setDate(LocalDate date) { this.date = date; }
	public BigDecimal getAmount() { return amount; }
	public void setAmount(BigDecimal amount) { this.amount = amount; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public FundingEvent() {}
	public FundingEvent(RunwayAnalysis runwayAnalysis, LocalDate date,
			BigDecimal amount, String name) {
		this.runwayAnalysis = runwayAnalysis;
		this.date = date;
		this.amount = amount;
		this.name = name;
	}
}
