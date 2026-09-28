// CashFlowScenarioPlanner.tsx
import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  type Node,
  type Connection,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom, atom, useSetAtom, useAtomValue } from 'jotai';
import { COLORS } from '../../colors';
import '../../scss/glow.scss';
import './CashFlowScenarioPlanner.scss';
import type { Scenario } from '../cashFlow';

type ScenarioNodeData = {
  label: string;
  amount?: number;
  probability?: number;
  impact?: 'positive' | 'negative' | 'neutral';
};
type ScenarioNode = Node<ScenarioNodeData>;

const editingStateAtom = atom<'viewing' | 'editing' | 'adding'>('viewing');
const scenariosAtom = atom<Scenario[]>([]);
const selectedScenarioNameAtom = atom<string | null>(null);
const newScenarioNameAtom = atom<string>('');

const selectedScenarioAtom = atom(
  (get) => {
    const list = get(scenariosAtom);
    const name = get(selectedScenarioNameAtom);
    return list.find((s) => s.name === name) ?? null;
  },
  (get, set, update: Scenario | null) => {
    if (!update) return;
    const list = get(scenariosAtom);
    const idx = list.findIndex((s) => s.name === update.name);
    const next =
      idx >= 0
        ? list.map((s, i) => (i === idx ? update : s))
        : [...list, update];
    set(scenariosAtom, next);
    set(selectedScenarioNameAtom, update.name);
  }
);

const statsAtom = atom((get) => {
  const list = get(scenariosAtom);
  const total = list.reduce((s, c) => s + c.probability, 0);
  const weighted = list.reduce((s, c) => s + c.expectedValue * c.probability, 0);
  return { total, weighted, valid: Math.abs(total - 1) < 0.01 };
});

const scenarioToFlow = (s: Scenario) => ({
  nodes: s.nodes.map((n) => ({
    id: n.id,
    type: 'scenario',
    position: { x: n.position.x, y: n.position.y }, 
    data: {
      label: n.data.label,
      amount: n.data.amount,
      probability: n.data.probability ?? undefined,
      impact: n.data.impact ?? 'neutral',
    },
  })),
  edges: s.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? '',
    animated: e.animated,
    data: { label: e.label },
    markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.PRIMARY },
    style: { stroke: COLORS.PRIMARY, strokeWidth: 2 },
  })),
});

const ScenarioNode = ({ data }: { data: ScenarioNodeData }) => {
  const glow =
    data.impact === 'positive'
      ? COLORS.INCOME
      : data.impact === 'negative'
      ? COLORS.EXPENSE
      : COLORS.PRIMARY;
  return (
    <div className="scenario-node">
      <div
        className="node-glow"
        style={{ '--glow-color': glow } as React.CSSProperties}
      />
      <div className="node-header">
        <div className="node-title">{data.label}</div>
        {data.amount !== undefined && (
          <div className="node-amount">${data.amount.toLocaleString()}</div>
        )}
      </div>
      {data.probability !== undefined && (
        <div className="node-probability">
          <div className="probability-bar">
            <div
              className="probability-fill"
              style={{ width: `${data.probability * 100}%` }}
            />
          </div>
          <div className="probability-value">
            {(data.probability * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
};
const nodeTypes: NodeTypes = { scenario: ScenarioNode };

const DetailsModal = ({
  scenario,
  onClose,
}: {
  scenario: Scenario;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{scenario.name}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="metric-row">
            <span>Probability</span>
            <span>{(scenario.probability * 100).toFixed(1)}%</span>
          </div>
          <div className="metric-row">
            <span>Expected Value</span>
            <span>${scenario.expectedValue.toLocaleString()}</span>
          </div>
          <div className="path-section">
            <h4>Scenario Path</h4>
            <div className="path-steps">
              {scenario.edges.map((e, i) => (
                <React.Fragment key={e.id}>
                  {i > 0 && <span className="arrow">→</span>}
                  <span className="step">{e.label}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

interface Props {
  initialScenarios: Scenario[]; 
}

const CashFlowScenarioPlanner = ({ initialScenarios }: Props) => {
  const setScenarios = useSetAtom(scenariosAtom);
  const setSelectedName = useSetAtom(selectedScenarioNameAtom);
  const [editing, setEditing] = useAtom(editingStateAtom);
  const [newName, setNewName] = useAtom(newScenarioNameAtom);
  const selected = useAtomValue(selectedScenarioAtom);
  const [, setSelectedScenario] = useAtom(selectedScenarioAtom);
  const stats = useAtomValue(statsAtom);

  const [nodes, setNodes, onNodesChange] = useNodesState<ScenarioNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<{ label?: string }>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => setScenarios(initialScenarios), [initialScenarios, setScenarios]);
  useEffect(() => {
    if (!selected) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: ns, edges: es } = scenarioToFlow(selected);
    setNodes(ns);
    setEdges(es);
  }, [selected, setNodes, setEdges]);

  const onConnect = (c: Connection) =>
    setEdges((eds) =>
      addEdge(
        {
          ...c,
          data: { label: '' },
          markerEnd: { type: MarkerType.ArrowClosed, color: COLORS.PRIMARY },
          style: { stroke: COLORS.PRIMARY, strokeWidth: 2 },
        },
        eds
      )
    );

  const addScenario = () => {
    setEditing('adding');
    setNewName('');
  };
  const confirmAdd = () => {
    const ns: Scenario = {
      name: newName,
      probability: 0.5,
      expectedValue: 0,
      nodes: [
        {
          id: '1',
          type: 'input',
          position: { x: 250, y: 5 },
          data: { label: 'Start', amount: 0, impact: 'neutral' },
        },
      ],
      edges: [],
    };
    setSelectedScenario(ns);
    setEditing('viewing');
  };
  const saveScenario = () => {
    if (!selected) return;
    const updated: Scenario = {
      ...selected,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as 'input' | 'output' | 'default',
        position: { x: n.position.x, y: n.position.y },
        data: {
          label: n.data.label,
          amount: n.data.amount,
          probability: n.data.probability,
          impact: n.data.impact,
        },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.data?.label,
        animated: e.animated,
      })),
    };
    setSelectedScenario(updated);
    setEditing('viewing');
  };

  return (
    <div className="cash-flow-scenario-planner">
      <div className="header">
        <h1>SCENARIO PLANNER</h1>
      </div>
      <div className="planner-container">
        <div className="scenario-list">
          <div className="list-header">
            <div>Scenarios</div>
            <motion.button
              className="add-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addScenario}
            >
              + Add
            </motion.button>
          </div>
          <div className="list-body">
            {useAtomValue(scenariosAtom).map((s) => (
              <motion.div
                key={s.name}
                className={`scenario-item ${selected?.name === s.name ? 'active' : ''}`}
                onClick={() => setSelectedName(s.name)}
                whileHover={{ x: 5 }}
              >
                <div className="scenario-name">{s.name}</div>
                <div className="scenario-probability">
                  {(s.probability * 100).toFixed(0)}%
                </div>
                {selected?.name === s.name && (
                  <div className="glow-effect glow-effect--primary" />
                )}
              </motion.div>
            ))}
          </div>
          <div className="list-footer">
            <div className="scenario-stats">
              <div className="stat">
                <div className="label">Total Probability</div>
                <div className={`value ${stats.valid ? '' : 'invalid'}`}>
                  {(stats.total * 100).toFixed(1)}%
                </div>
              </div>
              <div className="stat">
                <div className="label">Expected Value</div>
                <div className="value">${stats.weighted.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flow-container">
          {editing === 'adding' ? (
            <motion.div
              className="add-scenario-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3>Create New Scenario</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Scenario name"
              />
              <div className="form-actions">
                <motion.button
                  className="cancel-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing('viewing')}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="confirm-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmAdd}
                  disabled={!newName.trim()}
                >
                  Create
                </motion.button>
              </div>
            </motion.div>
          ) : selected ? (
            <>
              <div className="flow-controls">
                <button
                  className="details-btn"
                  onClick={() => setShowModal(true)}
                >
                  Details
                </button>
                <Panel position="top-right">
                  {editing === 'viewing' ? (
                    <motion.button
                      className="edit-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditing('editing')}
                    >
                      Edit Scenario
                    </motion.button>
                  ) : (
                    <div className="edit-actions">
                      <motion.button
                        className="save-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveScenario}
                      >
                        Save
                      </motion.button>
                      <motion.button
                        className="cancel-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing('viewing')}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  )}
                </Panel>
              </div>

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background />
                <Controls />
              </ReactFlow>

              <AnimatePresence>
                {showModal && (
                  <DetailsModal
                    scenario={selected}
                    onClose={() => setShowModal(false)}
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-message">
                Select or create a scenario to begin
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashFlowScenarioPlanner;
