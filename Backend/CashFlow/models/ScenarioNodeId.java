package org.mm.FinanceTracker.CashFlow.models;

import java.io.Serializable;
import java.util.Objects;

public class ScenarioNodeId implements Serializable {
	private Long scenario;  
	private String nodeId;  

	public ScenarioNodeId() {}

	public ScenarioNodeId(Long scenario, String nodeId) {
		this.scenario = scenario;
		this.nodeId = nodeId;
	}

	public Long getScenario() { return scenario; }
	public void setScenario(Long scenario) { this.scenario = scenario; }
	public String getNodeId() { return nodeId; }
	public void setNodeId(String nodeId) { this.nodeId = nodeId; }

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		ScenarioNodeId that = (ScenarioNodeId) o;
		return Objects.equals(scenario, that.scenario) &&
				Objects.equals(nodeId, that.nodeId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(scenario, nodeId);
	}
}
