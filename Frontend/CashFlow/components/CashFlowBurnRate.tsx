// CashFlowBurnRate.tsx
import React, { useMemo, useState, useRef } from 'react';
import { VictoryChart, VictoryBar, VictoryLine, VictoryAxis, VictoryVoronoiContainer, VictoryTheme, VictoryTooltip, VictoryGroup, VictoryLabel } from 'victory';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-scale-chromatic';
import { COLORS } from '../../colors';
import './CashFlowBurnRate.scss';
import '../../scss/glow.scss';

interface BurnRateDataPoint {
  date: Date | string; 
  burnRate: number;
  projectedBurnRate?: number;
  department?: string;
  category?: string;
}

interface CashFlowBurnRateProps {
  historicalData: BurnRateDataPoint[];
  forecastData: BurnRateDataPoint[];
  currentBurnRate: number;
  onDrillDown: (department: string | null) => void;
  onTimeRangeChange: (range: '1m' | '3m' | '6m' | '12m') => void;
}

const normalizeDate = (date: any): Date | null => {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateForAxis = (x: any): string => {
  const date = normalizeDate(x);
  return date ? date.toLocaleDateString('en-US', { month: 'short' }) : 'Invalid Date';
};

const BurnRateSparkline = ({ data }: { data: BurnRateDataPoint[] }) => {
  const sparklineData = useMemo(
    () =>
      data
        .map(d => ({
          x: normalizeDate(d.date),
          y: d.burnRate,
        }))
        .filter(d => d.x !== null), 
    [data]
  );

  return (
    <div className="sparkline-container">
      <VictoryChart
        padding={0}
        width={120}
        height={40}
        domainPadding={{ y: 5 }}
      >
        <VictoryLine
          style={{
            data: {
              stroke: COLORS.PRIMARY,
              strokeWidth: 2,
            },
          }}
          data={sparklineData}
        />
      </VictoryChart>
    </div>
  );
};

const BurnRateCategoryLegend = ({ categories, activeCategory, setActiveCategory }: {
  categories: string[];
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}) => {
  const colorScale = d3.schemeTableau10;

  return (
    <div className="category-legend">
      <motion.div
        className={`legend-item ${!activeCategory ? 'active' : ''}`}
        onClick={() => setActiveCategory(null)}
        whileHover={{ scale: 1.05 }}
        style={{ '--color': COLORS.PRIMARY } as React.CSSProperties}
      >
        All
      </motion.div>
      {categories.map((category, i) => (
        <motion.div
          key={category}
          className={`legend-item ${activeCategory === category ? 'active' : ''}`}
          onClick={() => setActiveCategory(category)}
          whileHover={{ scale: 1.05 }}
          style={{ '--color': colorScale[i % colorScale.length] } as React.CSSProperties}
        >
          {category}
        </motion.div>
      ))}
    </div>
  );
};

const BurnRateBarChart = ({ historicalData, forecastData, activeCategory }: {
  historicalData: BurnRateDataPoint[];
  forecastData: BurnRateDataPoint[];
  activeCategory: string | null;
}) => {
  const colorScale = d3.schemeTableau10;

  const filteredHistorical = useMemo(
    () => (activeCategory ? historicalData.filter(d => d.category === activeCategory) : historicalData),
    [historicalData, activeCategory]
  );

  const filteredForecast = useMemo(
    () => (activeCategory ? forecastData.filter(d => d.category === activeCategory) : forecastData),
    [forecastData, activeCategory]
  );

  const allCategories = useMemo(
    () =>
      Array.from(
        new Set([
          ...historicalData.map(d => d.category || 'Other'),
          ...forecastData.map(d => d.category || 'Other'),
        ])
      ),
    [historicalData, forecastData]
  );

  const getColor = (datum: any) => {
    const categoryIndex = allCategories.indexOf(datum.datum.category || 'Other');
    return colorScale[categoryIndex % colorScale.length];
  };

    const normalizedHistorical = useMemo(
    () =>
      filteredHistorical
        .map(d => ({
          ...d,
          date: normalizeDate(d.date),
        }))
        .filter(d => d.date !== null) as (BurnRateDataPoint & { date: Date })[],
    [filteredHistorical]
  );

  const normalizedForecast = useMemo(
    () =>
      filteredForecast
        .map(d => ({
          ...d,
          date: normalizeDate(d.date),
        }))
        .filter(d => d.date !== null) as (BurnRateDataPoint & { date: Date })[],
    [filteredForecast]
  );

  if (normalizedHistorical.length === 0 && normalizedForecast.length === 0) {
    return (
      <div className="burn-rate-chart">
        <div className="no-data-placeholder">
          <p>No data available for "{activeCategory}"</p>
        </div>
      </div>
    );
  }

  const maxY = Math.max(
    ...normalizedHistorical.map(d => d.burnRate),
    ...normalizedForecast.map(d => d.burnRate)
  );
  const minY = 0;

  const sortedData = [...normalizedHistorical].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <div className="burn-rate-chart">
      <VictoryChart
        width={600}
        height={300}
        theme={VictoryTheme.material}
        domain={{ y: [minY, maxY * 1.1] }}
        domainPadding={{ x: 20, y: 10 }}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            labels={({ datum }) => [
              `$${datum.burnRate.toLocaleString()}`,
              datum.category ? `${datum.category}` : '',
              datum.date ? new Date(datum.date).toLocaleDateString() : 'Invalid Date',
            ].join('\n')}
            labelComponent={
              <VictoryTooltip
                cornerRadius={5}
                flyoutStyle={{
                  fill: COLORS.SECONDARY,
                  stroke: COLORS.PRIMARY,
                }}
              />
            }
          />
        }
      >
        <VictoryAxis
          style={{
            axis: { stroke: COLORS.PRIMARY },
            tickLabels: { fill: COLORS.PRIMARY, fontSize: 10 },
          }}
          tickFormat={formatDateForAxis}
          tickValues={sortedData.map(d => d.date)}
          tickLabelComponent={
            <VictoryLabel
              angle={-45}
              textAnchor="end"
              dy={10}
            />
          }
        />

        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: COLORS.PRIMARY },
            tickLabels: { fill: COLORS.PRIMARY, fontSize: 10 },
          }}
          tickFormat={y => `$${(y / 1000).toFixed(1)}k`}
          tickCount={5}
        />

        <VictoryGroup offset={10}>
          <VictoryBar
            data={sortedData}
            x="date"
            y="burnRate"
            style={{
              data: {
                fill: ({ datum }) => getColor({ datum }),
                stroke: COLORS.SECONDARY,
                strokeWidth: 1,
              },
            }}
            barRatio={0.8}
          />
        </VictoryGroup>

        <VictoryLine
          data={normalizedForecast}
          x="date"
          y="burnRate"
          style={{
            data: {
              stroke: COLORS.PRIMARY,
              strokeWidth: 2,
              strokeDasharray: '5,3',
            },
          }}
        />
      </VictoryChart>
    </div>
  );
};

const DepartmentBurnTable = ({ data, activeDepartment, setActiveDepartment }: {
  data: BurnRateDataPoint[];
  activeDepartment: string | null;
  setActiveDepartment: (dept: string | null) => void;
}) => {
  const latestDataByDept = useMemo(() => {
    const deptMap = new Map<string, BurnRateDataPoint>();
    data.forEach(d => {
      if (!d.department) return;
      const existing = deptMap.get(d.department);
      const currentDate = normalizeDate(d.date);
      if (!currentDate) return;
      if (
        !existing ||
        !normalizeDate(existing.date) ||
        currentDate > normalizeDate(existing.date)!
      ) {
        deptMap.set(d.department, { ...d, date: currentDate });
      }
    });
    return Array.from(deptMap.entries()).sort(
      (a, b) => b[1].burnRate - a[1].burnRate
    );
  }, [data]);

  return (
    <div className="department-table">
      <div className="table-header">
        <div>Department</div>
        <div>Burn Rate</div>
        <div>Trend</div>
      </div>
      <div className="table-body">
        {latestDataByDept.map(([dept, dataPoint]) => (
          <motion.div
            key={dept}
            className={`table-row ${activeDepartment === dept ? 'active' : ''}`}
            onClick={() => setActiveDepartment(activeDepartment === dept ? null : dept)}
            whileHover={{ backgroundColor: 'rgba(70, 130, 180, 0.1)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="department-name">{dept}</div>
            <div className="burn-rate-value">${dataPoint.burnRate.toLocaleString()}</div>
            <div className="sparkline">
              <BurnRateSparkline data={data.filter(d => d.department === dept)} />
            </div>
            {activeDepartment === dept && <div className="glow-effect glow-effect--primary" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CashFlowBurnRate = React.memo((props: CashFlowBurnRateProps) => {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '12m'>('6m');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set([
          ...props.historicalData.map(d => d.category || 'Other'),
          ...props.forecastData.map(d => d.category || 'Other'),
        ])
      ),
    [props.historicalData, props.forecastData]
  );

  const filteredHistorical = useMemo(() => {
    let filtered = [...props.historicalData];
    if (activeDepartment) {
      filtered = filtered.filter(d => d.department === activeDepartment);
    }
    if (activeCategory) {
      filtered = filtered.filter(d => d.category === activeCategory);
    }
    return filtered;
  }, [props.historicalData, activeDepartment, activeCategory]);

  const filteredForecast = useMemo(() => {
    let filtered = [...props.forecastData];
    if (activeDepartment) {
      filtered = filtered.filter(d => d.department === activeDepartment);
    }
    if (activeCategory) {
      filtered = filtered.filter(d => d.category === activeCategory);
    }
    return filtered;
  }, [props.forecastData, activeDepartment, activeCategory]);

  const handleTimeRangeChange = (range: '1m' | '3m' | '6m' | '12m') => {
    setTimeRange(range);
    props.onTimeRangeChange(range);
  };

  const handleDrillDown = (dept: string | null) => {
    setActiveDepartment(dept);
    props.onDrillDown(dept);
  };

  return (
    <div className="cash-flow-burn-rate" ref={containerRef}>
      <div className="header">
        <h2>BURN RATE ANALYTICS</h2>
        <div className="time-range-selector">
          {(['1m', '3m', '6m', '12m'] as const).map(range => (
            <motion.button
              key={range}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTimeRangeChange(range)}
              style={{
                background: timeRange === range ? COLORS.PRIMARY : 'rgba(0, 0, 0, 0)',
                color: timeRange === range ? 'black' : COLORS.PRIMARY,
              }}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="current-burn-metric">
        <div className="metric-label">CURRENT BURN RATE</div>
        <div className="metric-value">
          ${props.currentBurnRate.toLocaleString()}
          <span className="metric-unit">/month</span>
        </div>
        <div className="glow-effect glow-effect--primary" />
      </div>

      <BurnRateCategoryLegend
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="chart-area">
        <BurnRateBarChart
          historicalData={filteredHistorical}
          forecastData={filteredForecast}
          activeCategory={activeCategory}
        />
        <DepartmentBurnTable
          data={props.historicalData}
          activeDepartment={activeDepartment}
          setActiveDepartment={handleDrillDown}
        />
      </div>

      <AnimatePresence>
        {activeDepartment && (
          <motion.div
            className="department-detail-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="panel-header">
              {activeDepartment} Breakdown
              <button className="close-btn" onClick={() => handleDrillDown(null)}>
                ×
              </button>
            </div>
            <div className="panel-content">
              <div className="detail-metrics">
                <div className="detail-metric">
                  <div className="label">Monthly Burn</div>
                  <div className="value">
                    ${filteredHistorical
                      .reduce((sum, d) => sum + d.burnRate, 0)
                      .toLocaleString()}
                  </div>
                </div>
                <div className="detail-metric">
                  <div className="label">% of Total</div>
                  <div className="value">
                    {(
                      (filteredHistorical.reduce((sum, d) => sum + d.burnRate, 0) /
                        props.historicalData.reduce((sum, d) => sum + d.burnRate, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default CashFlowBurnRate;
