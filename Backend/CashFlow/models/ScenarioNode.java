package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "scenario_nodes")
@IdClass(ScenarioNodeId.class)
public class ScenarioNode {
	@Id
	@Column(name = "scenario_id")
	private Long scenario;

	@Id
	@Column(name = "node_id", nullable = false, length = 100)
	private String nodeId;

	@ManyToOne
	@JoinColumn(name = "scenario_id", referencedColumnName = "id",
			insertable = false, updatable = false)
	@JsonBackReference
	private Scenario scenarioRef;

	@Column(name = "type", nullable = false, length = 20)
	private String type;

	@Column(name = "label", nullable = false, length = 100)
	private String label;

	@Column(name = "amount", precision = 19, scale = 4)
	private BigDecimal amount;

	@Column(name = "probability", precision = 5, scale = 4)
	private BigDecimal probability;

	@Column(name = "impact", length = 10)
	private String impact;

	@Column(name = "position_x", nullable = false, precision = 10, scale = 2)
	private BigDecimal positionX;

	@Column(name = "position_y", nullable = false, precision = 10, scale = 2)
	private BigDecimal positionY;

	public ScenarioNode() {}

	public ScenarioNode(Scenario scenarioRef, String nodeId, String type, String label,
						BigDecimal positionX, BigDecimal positionY) {
		setScenarioRef(scenarioRef);
		this.nodeId = nodeId;
		this.type = type;
		this.label = label;
		this.positionX = positionX;
		this.positionY = positionY;
	}

	public Long getScenario() {
		return scenario;
	}

	public void setScenario(Long scenario) {
		this.scenario = scenario;
	}

	public String getNodeId() {
		return nodeId;
	}

	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}

	public Scenario getScenarioRef() {
		return scenarioRef;
	}

	public void setScenarioRef(Scenario scenarioRef) {
		this.scenarioRef = scenarioRef;
		this.scenario = scenarioRef != null ? scenarioRef.getId() : null;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public BigDecimal getProbability() {
		return probability;
	}

	public void setProbability(BigDecimal probability) {
		this.probability = probability;
	}

	public String getImpact() {
		return impact;
	}

	public void setImpact(String impact) {
		this.impact = impact;
	}

	public BigDecimal getPositionX() {
		return positionX;
	}

	public void setPositionX(BigDecimal positionX) {
		this.positionX = positionX;
	}

	public BigDecimal getPositionY() {
		return positionY;
	}

	public void setPositionY(BigDecimal positionY) {
		this.positionY = positionY;
	}

}
