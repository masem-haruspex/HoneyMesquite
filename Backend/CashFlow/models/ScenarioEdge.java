package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "scenario_edges")
public class ScenarioEdge implements Serializable {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "scenario_id", nullable = false)
	@JsonBackReference("scenario-edges")
	private Scenario scenario;

	@ManyToOne
	@JoinColumns({
			@JoinColumn(name = "source_scenario_id", referencedColumnName = "scenario_id"),
			@JoinColumn(name = "source_node_id", referencedColumnName = "node_id")
	})
	private ScenarioNode source;

	@ManyToOne
	@JoinColumns({
			@JoinColumn(name = "target_scenario_id", referencedColumnName = "scenario_id"),
			@JoinColumn(name = "target_node_id", referencedColumnName = "node_id")
	})
	private ScenarioNode target;

	@Column(name = "label", length = 100)
	private String label;

	@Column(name = "animated")
	private Boolean animated = false;

	// Getters and Setters
	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Scenario getScenario() { return scenario; }
	public void setScenario(Scenario scenario) { this.scenario = scenario; }
	public ScenarioNode getSource() { return source; }
	public void setSource(ScenarioNode source) { this.source = source; }
	public ScenarioNode getTarget() { return target; }
	public void setTarget(ScenarioNode target) { this.target = target; }
	public String getLabel() { return label; }
	public void setLabel(String label) { this.label = label; }
	public Boolean getAnimated() { return animated; }
	public void setAnimated(Boolean animated) { this.animated = animated; }

	public ScenarioEdge() {}
	public ScenarioEdge(Scenario scenario, ScenarioNode source,
						ScenarioNode target, String label, Boolean animated) {
		this.scenario = scenario;
		this.source = source;
		this.target = target;
		this.label = label;
		this.animated = animated;
	}
}
