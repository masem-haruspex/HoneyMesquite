import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  VictoryChart, VictoryArea, VictoryLine, VictoryAxis, VictoryTooltip,
  VictoryVoronoiContainer, VictoryTheme, VictoryScatter,
} from 'victory';
import { COLORS } from '../../colors';
import '../../scss/glow.scss';
import './CashFlowRunway.scss';

interface FundingEvent { date: Date | string; amount: number; name: string; }
interface RunwayDataPoint {
  date: Date; cashBalance: number; burnRate: number; runwayMonths: number; fundingEvents?: FundingEvent[];
}
interface CashFlowRunwayProps {
  data: RunwayDataPoint[]; currentRunway: number;
  onTimeRangeChange: (range: '3m' | '6m' | '12m' | 'all') => void; onAddFunding: () => void;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplayValue(value); clearInterval(timer); }
      else { setDisplayValue(start); }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toFixed(1)}</span>;
};

const MetricCard = ({ label, value, children }: { label: string; value: React.ReactNode; children?: React.ReactNode }) => (
  <motion.div className="metric-card" whileHover={{ y: -5 }}>
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
    {children}
  </motion.div>
);

const RunwayChart = ({ data }: { data: RunwayDataPoint[] }) => {
  const validData = useMemo(() => data.filter(d => d.date instanceof Date && !isNaN(d.date.getTime()) &&
    typeof d.cashBalance === 'number' && !isNaN(d.cashBalance) &&
    typeof d.runwayMonths === 'number' && !isNaN(d.runwayMonths)), [data]);

  const processed = useMemo(() => {
    if (validData.length === 0) return []; 
    return validData.map(d => ({
      date: d.date.getTime(), cashBalance: d.cashBalance, runwayMonths: d.runwayMonths, threshold: 6,
      formattedDate: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
  }, [validData]);

  if (validData.length === 0) return <div className="runway-chart no-data">No valid data</div>;

  return (
    <div className="runway-chart">
      <svg width="0" height="0"><defs>
        <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.INCOME} stopOpacity={0.8} />
          <stop offset="95%" stopColor={COLORS.INCOME} stopOpacity={0.1} />
        </linearGradient>
      </defs></svg>

      <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 15, y: 10 }}
        containerComponent={
          <VictoryVoronoiContainer voronoiDimension="x"
            labels={({ datum }) => `${datum.formattedDate}\nRunway: ${datum.runwayMonths.toFixed(1)} months\nCash: $${datum.cashBalance.toLocaleString()}`}
            labelComponent={<VictoryTooltip flyoutStyle={{ fill: COLORS.SECONDARY, stroke: COLORS.PRIMARY, strokeWidth: 1 }}
              flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }} cornerRadius={4} style={{ fill: COLORS.TEXT }} />}
            />
        }>
        <VictoryAxis tickFormat={x => { const d = new Date(x); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short' }); }}
          style={{ axis: { stroke: COLORS.PRIMARY }, tickLabels: { fill: COLORS.PRIMARY, fontSize: 10 }, grid: { stroke: 'rgba(255,255,255,0.1)' } }} />
        <VictoryAxis dependentAxis
          style={{ axis: { stroke: COLORS.PRIMARY }, tickLabels: { fill: COLORS.PRIMARY, fontSize: 10 }, grid: { stroke: 'rgba(255,255,255,0.1)' } }} />

        <VictoryArea data={processed} x="date" y="cashBalance"
          style={{ data: { fill: 'url(#cashGradient)', stroke: COLORS.INCOME, strokeWidth: 2 } }} />
        <VictoryLine data={processed} x="date" y="runwayMonths"
          style={{ data: { stroke: COLORS.PRIMARY, strokeWidth: 3 } }} />
        <VictoryLine data={processed} x="date" y="threshold"
          style={{ data: { stroke: COLORS.EXPENSE, strokeWidth: 1, strokeDasharray: '5,5' } }} />
          </VictoryChart>
      </div>
  );
};

const RunwayCalendar = ({ data }: { data: RunwayDataPoint[] }) => {
  const validData = useMemo(() => data.filter(d => d.date instanceof Date && !isNaN(d.date.getTime()) && typeof d.runwayMonths === 'number' && !isNaN(d.runwayMonths)), [data]);

  const calendarData = useMemo(() => {
    if (validData.length === 0) return []; 
    const res: { date: Date; runwayMonths: number }[] = [];
    const start = new Date(validData[0].date);
    const end   = new Date(validData[validData.length - 1].date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dp = validData.find(item => item.date.toDateString() === d.toDateString());
      res.push({ date: new Date(d), runwayMonths: dp ? dp.runwayMonths : 0 });
    }
    return res;
  }, [validData]);

  if (validData.length === 0) return <div className="runway-calendar no-data">No valid data</div>;

  return (
    <div className="runway-calendar">
      <VictoryChart theme={VictoryTheme.material} height={300} padding={{ top: 40, bottom: 60, left: 60, right: 40 }} domainPadding={{ x: 15, y: 10 }}>
        <VictoryAxis tickFormat={x => { const d = new Date(x); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short' }); }}
          style={{ axis: { stroke: COLORS.PRIMARY }, tickLabels: { fill: COLORS.PRIMARY, fontSize: 10 }, grid: { stroke: 'rgba(255,255,255,0.1)' } }} />
        <VictoryAxis dependentAxis
          style={{ axis: { stroke: COLORS.PRIMARY }, tickLabels: { fill: COLORS.PRIMARY, fontSize: 10 }, grid: { stroke: 'rgba(255,255,255,0.1)' } }} />

        <VictoryScatter
          data={calendarData.map(d => ({
            date: d.date.getTime(), runwayMonths: d.runwayMonths,
            size: 5 + Math.min(d.runwayMonths * 2, 15),
            color: d.runwayMonths <= 3 ? COLORS.EXPENSE : d.runwayMonths <= 6 ? COLORS.WARNING : d.runwayMonths <= 9 ? COLORS.INCOME : '#52c41a',
            label: `${d.date.toLocaleDateString()}: ${d.runwayMonths.toFixed(1)} months`,
          }))}
          x="date" y="runwayMonths" size={({ datum }) => datum.size}
          style={{ data: { fill: ({ datum }) => datum.color, opacity: 0.8 } }}
          labels={({ datum }) => datum.label}
          labelComponent={
            <VictoryTooltip flyoutStyle={{ fill: COLORS.SECONDARY, stroke: COLORS.PRIMARY, strokeWidth: 1 }}
              flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }} cornerRadius={4} style={{ fill: COLORS.TEXT }} />
          }
          />
        </VictoryChart>
      </div>
  );
};

const FundingEventList = ({ events }: { events?: FundingEvent[] }) => {
  const valid = useMemo(() => (events || []).filter(ev => {
    const d = ev.date instanceof Date ? ev.date : new Date(ev.date);
    return d instanceof Date && !isNaN(d.getTime());
  }), [events]);
  if (valid.length === 0) return (
    <div className="funding-event-list">
      <div className="list-header">Upcoming Funding Events</div>
      <div className="empty-state">No upcoming funding events</div>
    </div>
  );
  return (
    <div className="funding-event-list">
      <div className="list-header">Upcoming Funding Events</div>
      <div className="list-body">
        {valid.map((ev, i) => (
          <motion.div key={`${ev.date}-${i}`} className="funding-event"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="event-date">{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div className="event-name">{ev.name}</div>
            <div className="event-amount">+${ev.amount.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CashFlowRunway = React.memo((props: CashFlowRunwayProps) => {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m' | 'all'>('all'); 
  const [viewMode, setViewMode] = useState<'chart' | 'calendar'>('chart');
  const containerRef = useRef<HTMLDivElement>(null);

  const timeFiltered = useMemo(() => {
    if (!props.data?.length) return [];
    const now = new Date();
    const cutoff = new Date();
    switch (timeRange) {
      case '3m':  cutoff.setMonth(now.getMonth() - 3); break;
      case '6m':  cutoff.setMonth(now.getMonth() - 6); break;
      case '12m': cutoff.setFullYear(now.getFullYear() - 1); break;
      case 'all':
      default:    return props.data; 
    }
    return props.data.filter(d => {
      const itemDate = d.date instanceof Date ? d.date : new Date(d.date);
      return !isNaN(itemDate.getTime()) && itemDate >= cutoff;
    });
  }, [props.data, timeRange]);

  const handleTimeRangeChange = (range: '3m' | '6m' | '12m' | 'all') => {
    setTimeRange(range);
    props.onTimeRangeChange(range);
  };

  const criticalMonths = useMemo(() => timeFiltered.filter(d => d.runwayMonths <= 6).length, [timeFiltered]);

  return (
    <div className="cash-flow-runway" ref={containerRef}>
      <div className="header">
        <h1>RUNWAY ANALYSIS</h1>
        <div className="controls">
          <div className="time-range-selector">
            {(['3m', '6m', '12m', 'all'] as const).map(r => (
              <motion.button key={r} className={`time-btn ${timeRange === r ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleTimeRangeChange(r)}>{r}</motion.button>
            ))}
          </div>
          <div className="view-toggle">
            <motion.button className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }} onClick={() => setViewMode('chart')}>Chart</motion.button>
            <motion.button className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }} onClick={() => setViewMode('calendar')}>Calendar</motion.button>
          </div>
        </div>
      </div>

      <div className="runway-metrics">
        <MetricCard label="Current Runway" value={<><AnimatedNumber value={props.currentRunway} /> months</>}>
          <div className="glow-effect" style={{ '--glow-color': props.currentRunway > 12 ? COLORS.INCOME : props.currentRunway > 6 ? COLORS.WARNING : COLORS.EXPENSE } as React.CSSProperties} />
        </MetricCard>

        <MetricCard label="Critical Months" value={<span style={{ color: criticalMonths > 0 ? COLORS.EXPENSE : COLORS.INCOME }}>{criticalMonths}</span>}>
          <div className="metric-subtext">(≤6 months runway)</div>
        </MetricCard>

        <MetricCard label="Projected Zero Date"
          value={new Date(new Date().setMonth(new Date().getMonth() + Math.floor(props.currentRunway)))
            .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}>
          <div className="glow-effect glow-effect--primary" />
        </MetricCard>

        <motion.button className="add-funding-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={props.onAddFunding}>
          + Add Funding
        </motion.button>
      </div>

      <div className="visualization-container">
        {viewMode === 'chart' ? <RunwayChart data={timeFiltered} /> : <RunwayCalendar data={timeFiltered} />}
      </div>

      <FundingEventList events={timeFiltered.flatMap(d => d.fundingEvents || [])} />
    </div>
  );
});

export default CashFlowRunway;
