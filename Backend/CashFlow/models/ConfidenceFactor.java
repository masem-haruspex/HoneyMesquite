package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "confidence_factors")
public class ConfidenceFactor {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "confidence_date", nullable = false)
	@JsonBackReference
	private ConfidenceData confidenceData;

	@Column(name = "factor", nullable = false, length = 100)
	private String factor;

	@Column(name = "impact", nullable = false, precision = 3, scale = 2)
	private BigDecimal impact;

	@Column(name = "confidence", nullable = false, precision = 3, scale = 2)
	private BigDecimal confidence;

	// Getters and Setters
	public Long getId() { return id; }
	public ConfidenceData getConfidenceData() { return confidenceData; }
	public void setConfidenceData(ConfidenceData confidenceData) { this.confidenceData = confidenceData; }
	public String getFactor() { return factor; }
	public void setFactor(String factor) { this.factor = factor; }
	public BigDecimal getImpact() { return impact; }
	public void setImpact(BigDecimal impact) { this.impact = impact; }
	public BigDecimal getConfidence() { return confidence; }
	public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }
	public void setId(Long id) { this.id = id; }

	public java.time.LocalDate getConfidenceDate() {
		return confidenceData != null ? confidenceData.getDate() : null;
	}

	public ConfidenceFactor() {}
	public ConfidenceFactor(ConfidenceData confidenceData, String factor,
			BigDecimal impact, BigDecimal confidence) {
		this.confidenceData = confidenceData;
		this.factor = factor;
		this.impact = impact;
		this.confidence = confidence;
	}
}
