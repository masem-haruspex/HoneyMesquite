package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "scenarios")
public class Scenario {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "name", nullable = false, length = 100, unique = true)
	private String name;

	@Column(name = "probability", precision = 5, scale = 4)
	private BigDecimal probability;

	@Column(name = "expected_value", precision = 19, scale = 4)
	private BigDecimal expectedValue;

	@OneToMany(mappedBy = "scenario", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<ScenarioNode> nodes;

	@OneToMany(mappedBy = "scenario", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<ScenarioEdge> edges;

	public Long getId() { return id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public BigDecimal getProbability() { return probability; }
	public void setProbability(BigDecimal probability) { this.probability = probability; }
	public BigDecimal getExpectedValue() { return expectedValue; }
	public void setExpectedValue(BigDecimal expectedValue) { this.expectedValue = expectedValue; }
	public List<ScenarioNode> getNodes() { return nodes; }
	public void setNodes(List<ScenarioNode> nodes) { this.nodes = nodes; }
	public List<ScenarioEdge> getEdges() { return edges; }
	public void setEdges(List<ScenarioEdge> edges) { this.edges = edges; }

	public Scenario() {}
	public Scenario(String name, BigDecimal probability, BigDecimal expectedValue) {
		this.name = name;
		this.probability = probability;
		this.expectedValue = expectedValue;
	}

	public void addNode(ScenarioNode node) {
		nodes.add(node);
		node.setScenarioRef(this);      
	}

	public void addEdge(ScenarioEdge edge) {
		edges.add(edge);
		edge.setScenario(this);
	}
}
