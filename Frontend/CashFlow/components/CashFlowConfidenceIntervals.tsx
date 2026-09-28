import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { COLORS } from '../../colors';
import './CashFlowConfidenceIntervals.scss';
import '../../scss/glow.scss';
import ConfidenceNetwork from './ConfidenceNetwork';

interface ConfidenceDataPoint {
  date: Date;
  lowerBound: number;
  upperBound: number;
  projectedAmount: number;
  confidenceLevel: number;
  contributingFactors?: {
    factor: string;
    impact: number; 
    confidence: number; 
  }[];
}

interface CashFlowConfidenceIntervalsProps {
  data: ConfidenceDataPoint[];
  currentConfidence: number;
  onTimeRangeChange: (range: '3m' | '6m' | '12m' | 'all') => void;
  onFactorSelect: (factor: string | null) => void;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
};

const ConfidenceIntervalChart = ({ data }: { data: ConfidenceDataPoint[] }) => {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      dateStr: formatDate(d.date),
      confidencePercent: d.confidenceLevel * 100,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="empty-chart-state">
        No data available for selected range
      </div>
    );
  }

  return (
    <div className="confidence-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 50, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.PRIMARY} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={COLORS.PRIMARY} stopOpacity={0}/>
            </linearGradient>
            <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke={COLORS.PRIMARY_DARK} strokeWidth="2" />
            </pattern>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />

          <XAxis
            dataKey="dateStr"
            stroke={COLORS.PRIMARY}
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            dy={10}
          />

          <YAxis
            yAxisId="left"
            stroke={COLORS.PRIMARY}
            fontSize={10}
            tickFormatter={formatCurrency}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            domain={['auto', 'auto']}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke={COLORS.PRIMARY}
            fontSize={10}
            tickFormatter={(val) => `${val}%`}
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            width={40}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 26, 33, 0.95)',
              borderColor: COLORS.PRIMARY,
              borderRadius: '4px',
              color: COLORS.PRIMARY_LIGHT,
              fontSize: '12px'
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: any, name: any) => {
              if (name === 'confidencePercent') return [`${value.toFixed(1)}%`, 'Confidence'];
              return [formatCurrency(value), name];
            }}
          />

          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill={COLORS.PRIMARY}
            fillOpacity={0.15}
            name="Upper Bound"
            animationDuration={1000}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="#0A1A21" 
            fillOpacity={1}
            name="Lower Bound"
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="projectedAmount"
            stroke={COLORS.PRIMARY}
            strokeWidth={3}
            dot={{ r: 4, fill: COLORS.PRIMARY, strokeWidth: 2, stroke: '#0A1A21' }}
            activeDot={{ r: 6 }}
            name="Projected Cash Flow"
            animationDuration={1000}
          />

          <Bar
            yAxisId="right"
            dataKey="confidencePercent"
            fill={COLORS.PRIMARY}
            opacity={0.4}
            name="Confidence Level"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const FactorImpactList = ({
  factors,
  onSelect
}: {
  factors?: ConfidenceDataPoint['contributingFactors'];
  onSelect: (factor: string) => void;
}) => {
  if (!factors || factors.length === 0) {
    return <div className="empty-factors">No contributing factors analyzed</div>;
  }

  return (
    <div className="factor-list">
      {factors.map((factor, index) => (
        <motion.div
          key={factor.factor}
          className="factor-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(factor.factor)}
        >
          <div className="factor-name">{factor.factor}</div>
          <div className="factor-impact">
            <div
              className="impact-bar"
              style={{
                width: `${Math.abs(factor.impact) * 100}%`,
                backgroundColor: factor.impact > 0 ? COLORS.INCOME : COLORS.EXPENSE,
                marginLeft: factor.impact > 0 ? 'auto' : '0'
              }}
            />
          </div>
          <div className="factor-confidence">
            <div className="confidence-meter">
              <div
                className="confidence-meter__fill"
                style={{
                  width: `${factor.confidence * 100}%`,
                  backgroundColor:
                    factor.confidence > 0.75
                      ? COLORS.INCOME
                      : factor.confidence > 0.5
                        ? COLORS.WARNING
                        : COLORS.EXPENSE
                }}
              />
            </div>
            <div className="confidence-value">{(factor.confidence * 100).toFixed(0)}%</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const CashFlowConfidenceIntervals = React.memo((props: CashFlowConfidenceIntervalsProps) => {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m' | 'all'>('6m');
  const [viewMode, setViewMode] = useState<'chart' | 'network'>('chart');
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '12m':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return props.data;
    }

    return props.data.filter(d => new Date(d.date) >= cutoffDate);
  }, [props.data, timeRange]);

  const allFactors = useMemo(() => {
    const factorMap = new Map<string, {
      factor: string;
      impact: number;
      confidence: number;
      count: number;
    }>();

    filteredData.forEach(point => {
      if (!point.contributingFactors) return;
      point.contributingFactors.forEach(f => {
        if (factorMap.has(f.factor)) {
          const existing = factorMap.get(f.factor)!;
          existing.impact = (existing.impact + f.impact) / 2; 
          existing.confidence = (existing.confidence + f.confidence) / 2; 
          existing.count += 1;
        } else {
          factorMap.set(f.factor, {
            factor: f.factor,
            impact: f.impact,
            confidence: f.confidence,
            count: 1
          });
        }
      });
    });

    return Array.from(factorMap.values()).map(f => ({
      factor: f.factor,
      impact: f.impact,
      confidence: f.confidence
    }));
  }, [filteredData]);

  const latestData = useMemo(() => {
    if (filteredData.length === 0) return null;
    return filteredData[filteredData.length - 1];
  }, [filteredData]);

  const handleTimeRangeChange = (range: '3m' | '6m' | '12m' | 'all') => {
    setTimeRange(range);
    props.onTimeRangeChange(range);
  };

  const handleFactorSelect = (factor: string) => {
    setSelectedFactor(factor);
    props.onFactorSelect(factor);
  };

  const handleClearSelection = () => {
    setSelectedFactor(null);
    props.onFactorSelect(null);
  };

  return (
    <div className="cash-flow-confidence">
      <div className="header">
        <h2>CONFIDENCE INTERVAL ANALYSIS</h2>
        <div className="controls">
          <div className="time-range-selector">
            {(['3m', '6m', '12m', 'all'] as const).map(range => (
              <motion.button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTimeRangeChange(range)}
              >
                {range}
              </motion.button>
            ))}
          </div>

          <div className="view-toggle">
            <motion.button
              className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              onClick={() => setViewMode('chart')}
            >
              Chart
            </motion.button>
            <motion.button
              className={`view-btn ${viewMode === 'network' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              onClick={() => setViewMode('network')}
            >
              Network
            </motion.button>
          </div>
        </div>
      </div>

      <div className="confidence-metrics">
        <motion.div className="metric-card" whileHover={{ y: -5 }}>
          <div className="metric-label">Current Confidence</div>
          <div className="metric-value">{(props.currentConfidence * 100).toFixed(0)}%</div>
          <div
            className="glow-effect"
            style={
              {
                '--glow-color': props.currentConfidence > 0.75
                  ? COLORS.INCOME
                  : props.currentConfidence > 0.5
                    ? COLORS.WARNING
                    : COLORS.EXPENSE
              } as React.CSSProperties
            }
          />
        </motion.div>

        <motion.div className="metric-card" whileHover={{ y: -5 }}>
          <div className="metric-label">Interval Width</div>
          <div className="metric-value">
            ±{latestData ? (((latestData.upperBound - latestData.lowerBound) / 2 / latestData.projectedAmount) * 100).toFixed(1) : '0'}%
          </div>
          <div className="metric-subtext">of projected</div>
        </motion.div>

        <motion.div className="metric-card" whileHover={{ y: -5 }}>
          <div className="metric-label">Key Factors</div>
          <div className="metric-value">{latestData?.contributingFactors?.length || 0}</div>
          <div className="metric-subtext">analyzed</div>
        </motion.div>
      </div>

      <div className="chart-area">
        {viewMode === 'chart' ? (
          <ConfidenceIntervalChart data={filteredData} />
        ) : (
          <div className="network-container">
            <ConfidenceNetwork
              factors={allFactors}
              onNodeClick={handleFactorSelect}
            />
            {selectedFactor && (
              <div className="network-selection">
                Selected: {selectedFactor}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="factor-analysis">
        <div className="analysis-header">
          <div className="analysis-title">Contributing Factors</div>
          {selectedFactor && (
            <button
              className="clear-selection"
              onClick={handleClearSelection}
            >
              Clear Selection
            </button>
          )}
        </div>
        <FactorImpactList
          factors={
            selectedFactor
              ? latestData?.contributingFactors?.filter(f => f.factor === selectedFactor)
              : latestData?.contributingFactors
          }
          onSelect={handleFactorSelect}
        />
      </div>
    </div>
  );
});

export default CashFlowConfidenceIntervals;
