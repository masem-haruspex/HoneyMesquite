import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { COLORS } from '../../colors';
import '../../scss/glow.scss';
import './CashFlowRiskMatrix.scss';

interface RiskFactor {
  id: string;
  name: string;
  likelihood: number; 
  impact: number; 
  velocity?: number; 
  mitigation?: string;
}

interface RiskMatrixProps {
  risks: RiskFactor[];
  onRiskSelect: (risk: RiskFactor | null) => void;
  onMitigationUpdate: (riskId: string, mitigation: string) => void;
}

const RiskRadarChart = ({ risk }: { risk: RiskFactor }) => {
  const data = [
    { subject: 'Likelihood', value: risk.likelihood, fullMark: 5 },
    { subject: 'Impact', value: risk.impact, fullMark: 5 },
    { subject: 'Velocity', value: risk.velocity || 3, fullMark: 5 },
  ];

  return (
    <div className="risk-radar">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar
            name={risk.name}
            dataKey="value"
            stroke={COLORS.PRIMARY}
            fill={COLORS.PRIMARY}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RiskMitigationEditor = ({ risk, onUpdate }: {
  risk: RiskFactor;
  onUpdate: (mitigation: string) => void;
}) => {
  const [mitigation, setMitigation] = useState(risk.mitigation || '');

  return (
    <motion.div className="risk-mitigation-editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h4>Mitigation Strategy</h4>
      <textarea
        value={mitigation}
        onChange={(e) => setMitigation(e.target.value)}
        placeholder="Describe mitigation strategy..."
      />
      <motion.button
        className="save-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onUpdate(mitigation)}
      >
        Save Mitigation
      </motion.button>
    </motion.div>
  );
};

const RiskMatrixLegend = () => {
  return (
    <div className="risk-legend">
      <div className="legend-title">Risk Matrix Guide</div>
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: COLORS.INCOME }} />
          <div className="legend-label">Critical Risk (High Impact)</div>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: COLORS.WARNING }} />
          <div className="legend-label">Probable Risk (High Likelihood)</div>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: COLORS.PRIMARY }} />
          <div className="legend-label">Low Risk</div>
        </div>
      </div>
    </div>
  );
};

const CashFlowRiskMatrix = React.memo((props: RiskMatrixProps) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskFactor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRiskSelect = (risk: RiskFactor) => {
    setSelectedRisk(risk);
    props.onRiskSelect(risk);
  };

  const handleMitigationUpdate = (mitigation: string) => {
    if (!selectedRisk) return;
    props.onMitigationUpdate(selectedRisk.id, mitigation);
    setSelectedRisk({ ...selectedRisk, mitigation });
  };

  const riskGrid = useMemo(() => {
  const grid: RiskFactor[][][] = [];
  for (let i = 0; i < 5; i++) {
    grid[i] = [];
    for (let j = 0; j < 5; j++) {
      grid[i][j] = [];
    }
  }

  props.risks.forEach(risk => {
    const row = 5 - risk.impact; 
    const col = risk.likelihood - 1; 
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      grid[row][col].push(risk);
    }
  });
  return grid;
}, [props.risks]);

  const yLabels = ['5 - High', '4', '3 - Medium', '2', '1 - Low'];
  
  const xLabels = ['1 - Low', '2', '3 - Medium', '4', '5 - High'];

    const getCellColor = (rowIndex: number, colIndex: number, hasRisks: boolean, isSelected: boolean) => {
    const impact = 5 - rowIndex; 
    const likelihood = colIndex + 1; 

    const riskScore = impact * likelihood;

    if (impact >= 4 && likelihood >= 4) {
      return isSelected ? COLORS.ERROR : hasRisks ? COLORS.ERROR : `${COLORS.ERROR}33`;
    } else if (impact >= 4) {
      return isSelected ? COLORS.ERROR : hasRisks ? `${COLORS.ERROR}CC` : `${COLORS.ERROR}33`;
    } else if (likelihood >= 4) {
      return isSelected ? COLORS.WARNING : hasRisks ? `${COLORS.WARNING}CC` : `${COLORS.WARNING}33`;
    } else if (riskScore >= 9) {
      return isSelected ? COLORS.PRIMARY : hasRisks ? `${COLORS.PRIMARY}CC` : `${COLORS.PRIMARY}33`;
    } else {
      return isSelected ? COLORS.INCOME : hasRisks ? `${COLORS.INCOME}CC` : `${COLORS.INCOME}33`;
    }
  };

  const getCellBorderColor = (rowIndex: number, colIndex: number, hasRisks: boolean, isSelected: boolean) => {
    if (isSelected) return COLORS.PRIMARY;

    const impact = 5 - rowIndex;
    const likelihood = colIndex + 1;

    if (impact >= 4 && likelihood >= 4) {
      return hasRisks ? COLORS.ERROR : `${COLORS.ERROR}66`;
    } else if (impact >= 4) {
      return hasRisks ? COLORS.ERROR : `${COLORS.ERROR}66`;
    } else if (likelihood >= 4) {
      return hasRisks ? COLORS.WARNING : `${COLORS.WARNING}66`;
    } else {
      return hasRisks ? COLORS.PRIMARY : `${COLORS.PRIMARY}66`;
    }
  };

  return (
    <div className="cash-flow-risk-matrix" ref={containerRef}>
      <div className="header">
        <h1>RISK ASSESSMENT MATRIX</h1>

        <div className="view-toggle">
          <span>View:</span>
          <button
            className="view-btn active"
            disabled
          >
            Grid View
          </button>
        </div>
      </div>

      <div className="matrix-container">
        <div className="matrix-grid">
          <div className="grid-container">
            <div className="y-axis-labels">
              {yLabels.map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>

            <div className="x-axis-labels">
              {xLabels.map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>

            <div className="y-axis-title">Impact</div>

            <div className="x-axis-title">Likelihood</div>

            <div className="risk-cells">
               {riskGrid.map((row, i) =>
                row.map((risks, j) => {
                  const hasRisks = risks.length > 0;
                  const isSelected = selectedRisk && risks.some(r => r.id === selectedRisk.id);
                  const cellColor = getCellColor(i, j, hasRisks, isSelected!);
                  const borderColor = getCellBorderColor(i, j, hasRisks, isSelected!);

                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`risk-cell ${hasRisks ? 'has-risk' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => hasRisks && handleRiskSelect(risks[0])}
                      style={{
                        backgroundColor: cellColor,
                        borderColor: borderColor
                      }}
                    >
                      {hasRisks && (
                        <>
                          <div className="risk-count">{risks.length}</div>
                          <div className="risk-names">{risks.map(r => r.name).join(', ')}</div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="risk-details">
          <AnimatePresence mode="wait">
            {selectedRisk ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="details-header">
                  <h3 className="risk-name">{selectedRisk.name}</h3>
                  <motion.button
                    className="close-btn"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedRisk(null);
                      props.onRiskSelect(null);
                    }}
                  >
                    ×
                  </motion.button>
                </div>

                <div className="risk-content">
                  <div className="risk-visualization">
                    <RiskRadarChart risk={selectedRisk} />
                    <div className="risk-scores">
                      <div className="score">
                        <div className="label">Likelihood</div>
                        <div className="value">{selectedRisk.likelihood}/5</div>
                      </div>
                      <div className="score">
                        <div className="label">Impact</div>
                        <div className="value">{selectedRisk.impact}/5</div>
                      </div>
                      <div className="score">
                        <div className="label">Velocity</div>
                        <div className="value">{selectedRisk.velocity || 'N/A'}/5</div>
                      </div>
                    </div>
                  </div>

                  <RiskMitigationEditor
                    risk={selectedRisk}
                    onUpdate={handleMitigationUpdate}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="no-risk-selected"
              >
                <div className="message">Select a risk to view details</div>
                <RiskMatrixLegend />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

export default CashFlowRiskMatrix;
