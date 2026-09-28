package org.mm.FinanceTracker.CashFlow.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

@Entity
@Table(name = "risk_factors")
public class RiskFactor {
	@Id
	@Column(name = "id", nullable = false, length = 36)
	private String id;

	@Column(name = "name", nullable = false, length = 100)
	private String name;

	@Column(name = "likelihood", columnDefinition = "SMALLINT")
	@Min(1) @Max(5)
	private Short likelihood;  

	@Column(name = "impact", columnDefinition = "SMALLINT")
	@Min(1) @Max(5)
	private Short impact;  

	@Column(name = "velocity", columnDefinition = "SMALLINT")
	@Min(1) @Max(5)
	private Short velocity;  

	@Column(name = "mitigation", columnDefinition = "TEXT")
	private String mitigation;

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public Short getLikelihood() { return likelihood; }
	public void setLikelihood(Short likelihood) { this.likelihood = likelihood; }
	public Short getImpact() { return impact; }
	public void setImpact(Short impact) { this.impact = impact; }
	public Short getVelocity() { return velocity; }
	public void setVelocity(Short velocity) { this.velocity = velocity; }
	public String getMitigation() { return mitigation; }
	public void setMitigation(String mitigation) { this.mitigation = mitigation; }

	public RiskFactor() {}
	public RiskFactor(String id, String name, Short likelihood,
					  Short impact, Short velocity, String mitigation) {
		this.id = id;
		this.name = name;
		this.likelihood = likelihood;
		this.impact = impact;
		this.velocity = velocity;
		this.mitigation = mitigation;
	}

	public BigDecimal calculateRiskScore() {
		if (likelihood == null || impact == null) {
			return BigDecimal.ZERO;
		}
		return new BigDecimal(likelihood * impact);
	}
}
