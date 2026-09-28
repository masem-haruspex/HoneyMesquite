// CashFlowOverview.tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { COLORS } from '../../colors';
import './CashFlowOverview.scss';

type Scenario = 'best_case' | 'base_case' | 'worst_case';
type TimeRange = '3m' | '6m' | '12m' | 'custom';

interface CashFlowDataPoint {
  date: Date;
  projectedAmount: number;
  burnRate?: number;
  runwayMonths?: number;
}

interface CashFlowOverviewProps {
  scenarios: {
    [key in Scenario]: {
      data: CashFlowDataPoint[];
      assumptions: string;
    };
  };
  currentCash: number;
  onScenarioChange: (scenario: Scenario) => void;
  onTimeRangeChange: (range: TimeRange) => void;
  onAddForecast: () => void;
  confidence: number;
}

const ScenarioIndicator = ({ active, scenario, onClick }: {
  active: boolean;
  scenario: Scenario;
  onClick: () => void;
}) => {
  const config = {
    best_case: { color: COLORS.INCOME, label: 'Best Case' },
    base_case: { color: COLORS.PRIMARY, label: 'Base Case' },
    worst_case: { color: COLORS.EXPENSE, label: 'Worst Case' },
  }[scenario];

  return (
    <motion.div
      className="scenario-indicator"
      animate={{
        backgroundColor: active ? config.color : 'hsla(0, 0%, 0%, 0)',
          borderColor: config.color,
          color: active ? COLORS.SECONDARY : config.color,
      }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      {config.label}
      {active && (
        <div
          className="glow-effect"
          style={{ '--glow-color': config.color } as React.CSSProperties}
        />
      )}
    </motion.div>
  );
};

const ConfidenceMeter = ({ value }: { value: number }) => (
  <>
    <div
      className="metric-card__value"
      style={{
        color:
          value > 0.75
            ? COLORS.INCOME
            : value > 0.50
            ? COLORS.WARNING
            : COLORS.EXPENSE,
      }}
    >
      {(value).toFixed(0)}%
    </div>

    <div className="metric-card__trend">
      {value > 0.8 ? '● High' : value > 0.5 ? '● Med' : '● Low'}
    </div>

    <div className="confidence-meter">
      <motion.div
        className="confidence-meter__fill"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8 }}
        style={{
          backgroundColor:
            value > 0.75
              ? COLORS.INCOME
              : value > 0.50
              ? COLORS.WARNING
              : COLORS.EXPENSE,
        }}
      />
    </div>
  </>
);

const CashFlowChart = ({ data, currentCash, timeRange, scenario }: {
  data: CashFlowDataPoint[];
  currentCash: number;
  timeRange: TimeRange;
  scenario: string;
}) => {
  const now = new Date();

  const cutoff = useMemo(() => {
    switch (timeRange) {
      case '3m':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6m':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '12m':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  }, [timeRange, now]);

  const filteredData = useMemo(() => {
    const futureCutoff = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return data.filter(d => d.date >= cutoff && d.date <= futureCutoff);
  }, [data, cutoff, now]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredData]);

  if (filteredData.length === 0) {
    return (
      <div className="cash-flow-chart empty">
        <div className="no-data-placeholder">
          No forecast data in selected range.
          <br />
          Try switching to "12m" or adding new forecasts.
        </div>
      </div>
    );
  }

  const getChartWidth = () => {
    switch (timeRange) {
      case '3m': return 500;
      case '6m': return 700;
      case '12m': return 900;
      default: return 700;
    }
  };

  const getTickCount = () => {
    switch (timeRange) {
      case '3m': return 5;
      case '6m': return 7;
      case '12m': return 12;
      default: return 7;
    }
  };

  const chartWidth = getChartWidth();
  const chartHeight = 200;

  const minValue = Math.min(...sortedData.map(d => d.projectedAmount), currentCash);
  const maxValue = Math.max(...sortedData.map(d => d.projectedAmount), currentCash);
  const range = maxValue - minValue || 1;

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  const getX = (date: Date) => {
    const diff = date.getTime() - cutoff.getTime();
    const totalDiff = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).getTime() - cutoff.getTime();
    return (diff / totalDiff) * chartWidth;
  };

  const getLabels = () => {
    const labels = [];
    const tickCount = getTickCount();

    for (let i = 0; i < tickCount; i++) {
      const date = new Date(
        cutoff.getTime() + (i / (tickCount - 1)) * (new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).getTime() - cutoff.getTime())
      );
      labels.push(date);
    }
    return labels;
  };

  const labels = getLabels();

  return (
    <div className="cash-flow-chart">
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="chart-svg">
        <text
          x={chartWidth / 2}
          y={-5}
          textAnchor="middle"
          className="chart-title"
        >
          Projected Cash Balance ({scenario})
        </text>

        <g className="y-axis-labels">
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const value = minValue + p * range;
            return (
              <text
                key={i}
                x="-10"
                y={getY(value)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="axis-label"
              >
                ${Math.floor(value / 1000)}k
              </text>
            );
          })}
        </g>

        <g className="grid-lines">
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
            <line
              key={i}
              x1={0}
              y1={getY(minValue + p * range)}
              x2={chartWidth}
              y2={getY(minValue + p * range)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
        </g>

        <g className="x-axis-labels">
          {labels.map((date, i) => (
            <text
              key={i}
              x={(i / (labels.length - 1)) * chartWidth}
              y={chartHeight + 20}
              textAnchor="middle"
              className="axis-label"
            >
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))}
        </g>

        <line
          x1={getX(now)}
          y1={0}
          x2={getX(now)}
          y2={chartHeight}
          stroke={COLORS.PRIMARY}
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <text
          x={getX(now)}
          y={-10}
          textAnchor="middle"
          className="today-label"
        >
          Today
        </text>

        <circle
          cx={getX(now)}
          cy={getY(currentCash)}
          r="6"
          fill={COLORS.WARNING}
          stroke={COLORS.SECONDARY}
          strokeWidth="2"
        />

        <polyline
          points={sortedData.map(d => `${getX(d.date)},${getY(d.projectedAmount)}`).join(' ')}
          fill="none"
          stroke={COLORS.PRIMARY}
          strokeWidth="3"
          className="forecast-line"
        />

        {sortedData.map((point, index) => (
          <Tippy
            key={index}
            content={
              <div>
                <div><strong>{point.date.toLocaleDateString()}</strong></div>
                <div>Balance: ${point.projectedAmount.toLocaleString()}</div>
                {point.burnRate && <div>Burn Rate: ${point.burnRate.toLocaleString()}/mo</div>}
              </div>
            }
            placement="top"
          >
            <circle
              cx={getX(point.date)}
              cy={getY(point.projectedAmount)}
              r="4"
              fill={COLORS.PRIMARY}
              className="forecast-dot"
            />
          </Tippy>
        ))}
      </svg>
    </div>
  );
};

const CashFlowOverview = React.memo((props: CashFlowOverviewProps) => {
    console.log('🔍 confidence prop', props.confidence);   

  const [activeScenario, setActiveScenario] = useState<Scenario>('base_case');
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');

  const { data, assumptions } = props.scenarios[activeScenario];
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  const burnRate = latestData?.burnRate || 0;
  const runway = burnRate > 0 && latestData?.projectedAmount != null
  ? latestData.projectedAmount / burnRate
  : 0;

  const handleScenarioChange = (scenario: Scenario) => {
    setActiveScenario(scenario);
    props.onScenarioChange(scenario);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    props.onTimeRangeChange(range);
  };

  return (
    <div className="cash-flow-overview">
      <div className="overview-header">
        <h1>CASH FLOW DASHBOARD</h1>
      </div>

      <div className="metrics-row">
        <motion.div
          className="metric-card"
          whileHover={{ y: -5 }}
        >
          <div className="metric-card__label">Runway</div>
          <div
            className="metric-card__value"
            style={{
              color: runway > 12
                ? COLORS.INCOME
                : runway > 6
                  ? COLORS.WARNING
                  : COLORS.EXPENSE,
            }}
          >
            {runway.toFixed(1)} months
          </div>
          <div
            className="glow-effect"
            style={{
              '--glow-color': runway > 12
                ? COLORS.INCOME
                : runway > 6
                  ? COLORS.WARNING
                  : COLORS.EXPENSE,
            } as React.CSSProperties}
          />
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ y: -5 }}
        >
          <div className="metric-card__label">Burn Rate</div>
          <div className="metric-card__value">
            ${burnRate.toLocaleString()}/mo
          </div>
          <div className="metric-card__trend">
            {burnRate > 0 ? '▲' : '▼'} 5%
          </div>
        </motion.div>

        <motion.div
          className="metric-card"
          whileHover={{ y: -5 }}
        >
          <div className="metric-card__label">Confidence</div>
          <ConfidenceMeter value={props.confidence * 100} />
        </motion.div>

        <motion.div
          className="metric-card scenario-selector"
          whileHover={{ y: -5 }}
        >
          <div className="scenario-container">
            <ScenarioIndicator
              active={activeScenario === 'best_case'}
              scenario="best_case"
              onClick={() => handleScenarioChange('best_case')}
            />
            <ScenarioIndicator
              active={activeScenario === 'base_case'}
              scenario="base_case"
              onClick={() => handleScenarioChange('base_case')}
            />
            <ScenarioIndicator
              active={activeScenario === 'worst_case'}
              scenario="worst_case"
              onClick={() => handleScenarioChange('worst_case')}
            />
          </div>
        </motion.div>
      </div>

      <div className="overview-bottom">
        <div className="chart-container-container">
          <div className="time-range-selector">
            {(['3m', '6m', '12m'] as TimeRange[]).map((range) => (
              <motion.button
                key={range}
                className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTimeRangeChange(range)}
              >
                {range}
              </motion.button>
            ))}
          </div>

          <CashFlowChart
  data={data}
  currentCash={props.currentCash}
  timeRange={timeRange}
  scenario={activeScenario.replace('_', ' ')}
/>
        </div>

        <Tippy content="Edit assumptions" placement="bottom">
          <motion.div
            className="assumptions-panel"
            whileHover={{ boxShadow: `0 0 15px ${COLORS.PRIMARY}` }}
            onClick={props.onAddForecast}
          >
            <div className="assumptions-panel__header">
              Scenario Assumptions
            </div>
            <div className="assumptions-panel__content">
              {assumptions || "No assumptions documented for this scenario"}
            </div>
          </motion.div>
        </Tippy>
      </div>
    </div>
  );
});

export default CashFlowOverview;
