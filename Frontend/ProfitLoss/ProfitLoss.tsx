//ProfitLoss.tsx
import { Html, Text } from '@react-three/drei';
import { useEffect, useRef, useState, useMemo } from 'react';
import { COLORS } from '../colors';
import type { ProfitLossStatement, CreateProfitLossDto } from './profitLoss';
import { ProfitLossService } from './ProfitLossService';
import './ProfitLoss.scss';
import '../scss/glow.scss';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import LineChart from './components/LineChart';
import PieChart3D from './components/PieChart3D';
import BarChart3D from './components/BarChart3D';
import ProfitLossForm from './ProfitLossForm';
import StatementList from './components/StatementList';
import RollingYearChart from './components/RollingYearChart';
import ProfitabilityTrend from './components/ProfitabilityTrend';
import { DEFAULT_FILTERS, applyFilters } from './utils';
import { getYTDData, getBudgetComparison, type YTDData, type BudgetComparison } from './utils';
import { BudgetService } from '../Budget/BudgetService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { profitLossDataAtom, loadingAtom } from '../atoms/dataAtoms';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, when: "beforeChildren", staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export default function ProfitLoss({ position }: { position: [number, number, number] }) {
  position[0] += 0.1;
  const [globalProfitLossData] = useAtom(profitLossDataAtom);
  const [appLoading] = useAtom(loadingAtom);

  const [statements, setStatements] = useState<ProfitLossStatement[]>([]);
  const [selectedStatement, setSelectedStatement] = useState<ProfitLossStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const particlesRef = useRef<THREE.Points>(null);
  const [chartView, setChartView] = useState<'bar' | 'pie'>('bar');
  const [comparisonView, setComparisonView] = useState<'qoq' | 'yoy' | 'budget'>('qoq');
  const [ytdData, setYtdData] = useState<YTDData | null>(null);
  const [budgetComparison, setBudgetComparison] = useState<BudgetComparison | null>(null);
  const [rollingData, setRollingData] = useState<{ labels: string[]; revenue: number[]; netIncome: number[] }>({
    labels: [],
    revenue: [],
    netIncome: [],
  });

  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    value: number;
    color: string;
    percentage?: number;
    yoyChange?: number;
    forecastDelta?: number;
  } | null>(null);

  useEffect(() => {
    if (globalProfitLossData.length > 0) {
      const data = globalProfitLossData;
      const categoryFilters = data.reduce((acc: Record<number, boolean>, stmt) => {
        stmt.lineItems.forEach((item: any) => {
          const categoryId = item.category?.id;
          if (categoryId) acc[categoryId] = true;
        });
        return acc;
      }, {});
      setFilters((prev) => ({ ...prev, categoryFilters }));
      setStatements(data);
      setLoading(false);
      if (data.length > 0) setSelectedStatement(data[0]);
    } else {
      async function loadStatements() {
        const data = await ProfitLossService.getAll();
        const categoryFilters = data.reduce((acc: Record<number, boolean>, stmt) => {
          stmt.lineItems.forEach((item) => {
            const categoryId = item.category?.id;
            if (categoryId) acc[categoryId] = true;
          });
          return acc;
        }, {});
        setFilters((prev) => ({ ...prev, categoryFilters }));
        setStatements(data);
        setLoading(false);
        if (data.length > 0) setSelectedStatement(data[0]);
      }
      loadStatements();
    }
  }, [globalProfitLossData]);

  useEffect(() => {
    if (!selectedStatement) return;

    setYtdData(getYTDData(statements, selectedStatement));

    const fiscalYear = parseInt(selectedStatement.periodName.split('-')[1]);
    BudgetService.getBudgetVsActual(1, fiscalYear)
      .then(data => {
        const comp = getBudgetComparison(selectedStatement, data);
        setBudgetComparison(comp);
      })
      .catch(console.error);

    const sortedStatements = [...statements].sort(
      (a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    );
    const last12 = sortedStatements.slice(-12);

    setRollingData({
      labels: last12.map(s => s.periodName),
      revenue: last12.map(s => parseFloat(s.revenue)),
      netIncome: last12.map(s => parseFloat(s.netIncome || '0')),
    });
  }, [selectedStatement, statements]);

  useEffect(() => {
    async function loadStatements() {
      const data = await ProfitLossService.getAll();
      const categoryFilters = data.reduce((acc: Record<number, boolean>, stmt) => {
        stmt.lineItems.forEach((item) => {
          const categoryId = item.category?.id;
          if (categoryId) acc[categoryId] = true;
        });
        return acc;
      }, {});
      setFilters((prev) => ({ ...prev, categoryFilters }));
      setStatements(data);
      setLoading(false);
      if (data.length > 0) setSelectedStatement(data[0]);
    }
    loadStatements();
  }, []);

  const filteredStatements = useMemo(
    () => applyFilters(statements, filters),
    [statements, filters]
  );

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  const handleAddStatement = async (statement: CreateProfitLossDto) => {
    const newStatement = await ProfitLossService.create(statement);
    setStatements([...statements, newStatement]);
    setSelectedStatement(newStatement);
    setShowForm(false);
  };

  const financialData = selectedStatement
    ? {
      revenue: parseFloat(selectedStatement.revenue),
      cogs: parseFloat(selectedStatement.cogs),
      grossProfit: parseFloat(selectedStatement.grossProfit || '0'),
      operatingExpenses: parseFloat(selectedStatement.operatingExpenses),
      netIncome: parseFloat(selectedStatement.netIncome || '0'),
    }
    : null;

  const yoyGrowth = useMemo(() => {
    if (!selectedStatement) return null;
    const match = selectedStatement.periodName.match(/Q([1-4])-(\d{4})/);
    if (!match) return null;
    const [_, quarter, year] = match;
    const prevYearPeriod = `Q${quarter}-${Number(year) - 1}`;
    const prevYearStatement = statements.find(s => s.periodName === prevYearPeriod);
    if (!prevYearStatement) return null;

    const calcGrowth = (curr: string, prev: string) => {
      const c = parseFloat(curr);
      const p = parseFloat(prev);
      return p === 0 ? (c === 0 ? 0 : 100) : ((c - p) / p) * 100;
    };

    return {
      revenue: calcGrowth(selectedStatement.revenue, prevYearStatement.revenue),
      cogs: calcGrowth(selectedStatement.cogs, prevYearStatement.cogs),
      opex: calcGrowth(selectedStatement.operatingExpenses, prevYearStatement.operatingExpenses),
    };
  }, [selectedStatement, statements]);

  const qoqGrowth = useMemo(() => {
    if (filteredStatements.length < 2) return null;
    const sorted = [...filteredStatements].sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime());
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const calcGrowth = (curr: string, prev: string) => {
      const c = parseFloat(curr);
      const p = parseFloat(prev);
      return p === 0 ? (c === 0 ? 0 : 100) : ((c - p) / p) * 100;
    };
    return {
      revenue: calcGrowth(latest.revenue, prev.revenue),
      cogs: calcGrowth(latest.cogs, prev.cogs),
      opex: calcGrowth(latest.operatingExpenses, prev.operatingExpenses),
    };
  }, [filteredStatements]);

  useEffect(() => {
    if (!selectedStatement) return;
    setYtdData(getYTDData(statements, selectedStatement));

    const fiscalYear = parseInt(selectedStatement.periodName.split('-')[1]);
    BudgetService.getBudgetVsActual(1, fiscalYear)
      .then(data => {
        const comp = getBudgetComparison(selectedStatement, data);
        setBudgetComparison(comp);
      })
      .catch(console.error);
  }, [selectedStatement, statements]);

  const recentStatements = useMemo(() => {
    return [...filteredStatements]
      .sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime())
      .slice(-3);
  }, [filteredStatements]);

  const totalRevenue = financialData?.revenue || 1;

  const handleBarHover = (label: string, value: number, color: string) => {
    const percentage = ((value / totalRevenue) * 100).toFixed(1);
    const yoy = yoyGrowth?.revenue ? (value > 0 ? yoyGrowth.revenue : 0) : null;
    const forecastDelta = selectedStatement?.isForecast ? ((value * 0.1) * (Math.random() > 0.5 ? 1 : -1)) : 0;

    setHoveredPoint({
      label,
      value,
      color,
      percentage: parseFloat(percentage),
      yoyChange: yoy || 0,
      forecastDelta,
    });
  };

  const handleBarLeave = () => {
    setHoveredPoint(null);
  };

    if (appLoading) {
    return (
      <group position={position}>
        <Text>Loading application data...</Text>
      </group>
    );
  }

  if (loading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          Loading financial data...
        </Text>
      </group>
    );
  }

  if (statements.length === 0) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          No statements found. Add one to get started.
        </Text>
      </group>
    );
  }

  if (!selectedStatement) {
    return null;
  }

  return (
    <group position={position}>
      {showForm && (
        <Html position={[-2, 5, 8]} style={{ width: '500px', zIndex: 100 }}>
          <ProfitLossForm
            onSubmit={handleAddStatement}
            onCancel={() => setShowForm(false)}
          />
        </Html>
      )}

      {!showForm && (
        <>
          <Html position={[0, 0, 1]} style={{ pointerEvents: 'none' }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
            </motion.div>
          </Html>

          <group position={[0, 0, 0]}>
            <Html position={[0.8, 3.4, 0]} transform>
              <motion.div
                variants={containerVariants}
                style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}
              >
                <button
                  onClick={() => setChartView('bar')}
                  style={{
                    background: 'transparent',
                      border: 'none',
                      borderBottom: chartView === 'bar' ? `2px solid ${COLORS.PRIMARY}` : '2px solid transparent',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                      fontWeight: chartView === 'bar' ? 'bold' : 'normal',
                      transition: 'all 0.2s ease',
                  }}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartView('pie')}
                  style={{
                    background: 'transparent',
                      border: 'none',
                      borderBottom: chartView === 'pie' ? `2px solid ${COLORS.PRIMARY}` : '2px solid transparent',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                      fontWeight: chartView === 'pie' ? 'bold' : 'normal',
                      transition: 'all 0.2s ease',
                  }}
                >
                  Pie
                </button>
              </motion.div>
            </Html>

            <group position={[0.8, 1.2, 0]}>
              {chartView === 'bar' ? (
                <BarChart3D
                  data={[
                    { name: 'Revenue', value: financialData!.revenue, color: COLORS.INCOME },
                  { name: 'Gross Profit', value: financialData!.grossProfit, color: COLORS.INCOME_LIGHT },
                  { name: 'Net Income', value: financialData!.netIncome, color: financialData!.netIncome >= 0 ? COLORS.PRIMARY : COLORS.EXPENSE },
                  ]}
                  position={[0, -0.4, 1]}
                  size={[1.8 * 3.0, 1.2 * 3.0, 0.7 * 3.0]}
                  onPointerOver={(e: any) => {
                    if (e.object?.userData?.label) {
                      const { label, value, color } = e.object.userData;
                  handleBarHover(label, value, color);
                  }
                  }}
                  onPointerOut={handleBarLeave}
                />
              ) : (
                <PieChart3D
                  data={[
                    { value: financialData!.revenue, color: COLORS.INCOME, name: 'Revenue' },
                  { value: financialData!.cogs, color: COLORS.EXPENSE, name: 'COGS' },
                  { value: financialData!.operatingExpenses, color: COLORS.EXPENSE_DARK, name: 'OpEx' },
                  ]}
                  position={[0, -0.8, 0]}
                  size={2.3}
                />
              )}
            </group>

            {hoveredPoint && (
              <Html position={[3.0, -1.0, 2]} transform style={{ pointerEvents: 'none' }}>
                <motion.div
                  variants={containerVariants}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    background: 'rgba(0, 0, 0, 0.85)',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      border: `1px solid ${hoveredPoint.color}`,
                      minWidth: '180px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <strong>{hoveredPoint.label}</strong>
                  <div style={{ marginTop: '6px' }}>
                    <div>Value: <strong>${hoveredPoint.value.toLocaleString()}</strong></div>
                    <div>% of Total: <strong>{hoveredPoint.percentage?.toFixed(1)}%</strong></div>
                    {hoveredPoint.yoyChange !== undefined && (
                      <div>YoY: <strong style={{ color: hoveredPoint.yoyChange >= 0 ? '#4CAF50' : '#F44336' }}>
                        {hoveredPoint.yoyChange >= 0 ? '+' : ''}{hoveredPoint.yoyChange.toFixed(1)}%
                      </strong></div>
                    )}
                    {selectedStatement.isForecast && hoveredPoint.forecastDelta && (
                      <div>Forecast Delta: <strong style={{ color: hoveredPoint.forecastDelta >= 0 ? '#4CAF50' : '#F44336' }}>
                        {hoveredPoint.forecastDelta >= 0 ? '+' : ''}${Math.abs(hoveredPoint.forecastDelta).toFixed(0)}
                      </strong></div>
                    )}
                  </div>
                </motion.div>
              </Html>
            )}

            <Html position={[-9.00, -6.26, 1]} transform style={{ width: '340px', height: 'max-content' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedStatement.id}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="profit-loss-panel">
                    <div className="profit-loss-panel__content">
                      <div className="profit-loss-panel__compare">
                        <div className="profit-loss-panel__tabs">
                          <button
                            className={`profit-loss-panel__tab ${comparisonView === 'qoq' ? 'active' : ''}`}
                            onClick={() => setComparisonView('qoq')}
                          >
                            QoQ
                          </button>
                          <button
                            className={`profit-loss-panel__tab ${comparisonView === 'yoy' ? 'active' : ''}`}
                            onClick={() => setComparisonView('yoy')}
                          >
                            YoY
                          </button>
                          <button
                            className={`profit-loss-panel__tab ${comparisonView === 'budget' ? 'active' : ''}`}
                            onClick={() => setComparisonView('budget')}
                          >
                            Budget
                          </button>
                        </div>
                      </div>
                      <div className="profit-loss-panel__compare">
                        <ul className="profit-loss-panel__growth-list">
                          {comparisonView === 'qoq' && qoqGrowth && (
                            <>
                              <li className="profit-loss-panel__growth-item">
                                Rev: <span style={{ color: qoqGrowth.revenue >= 0 ? COLORS.INCOME : COLORS.EXPENSE }}>
                                  {qoqGrowth.revenue >= 0 ? '+' : ''}{qoqGrowth.revenue.toFixed(1)}%
                                </span>
                              </li>
                              <li className="profit-loss-panel__growth-item">
                                OpEx: <span style={{ color: qoqGrowth.opex >= 0 ? COLORS.EXPENSE_DARK : COLORS.INCOME_LIGHT }}>
                                  {qoqGrowth.opex >= 0 ? '+' : ''}{qoqGrowth.opex.toFixed(1)}%
                                </span>
                              </li>
                            </>
                          )}
                          {comparisonView === 'yoy' && yoyGrowth && (
                            <>
                              <li className="profit-loss-panel__growth-item">
                                Rev: <span style={{ color: yoyGrowth.revenue >= 0 ? COLORS.INCOME : COLORS.EXPENSE }}>
                                  {yoyGrowth.revenue >= 0 ? '+' : ''}{yoyGrowth.revenue.toFixed(1)}%
                                </span>
                              </li>
                              <li className="profit-loss-panel__growth-item">
                                OpEx: <span style={{ color: yoyGrowth.opex >= 0 ? COLORS.EXPENSE_DARK : COLORS.INCOME_LIGHT }}>
                                  {yoyGrowth.opex >= 0 ? '+' : ''}{yoyGrowth.opex.toFixed(1)}%
                                </span>
                              </li>
                            </>
                          )}
                          {comparisonView === 'budget' && budgetComparison && (
                            <>
                              <li className="profit-loss-panel__growth-item">
                                Rev: <span style={{ color: budgetComparison.revenue.variancePercent >= 0 ? COLORS.INCOME : COLORS.EXPENSE }}>
                                  {budgetComparison.revenue.variancePercent >= 0 ? '+' : ''}{budgetComparison.revenue.variancePercent.toFixed(1)}%
                                </span>
                              </li>
                              <li className="profit-loss-panel__growth-item">
                                OpEx: <span style={{ color: budgetComparison.operatingExpenses.variancePercent >= 0 ? COLORS.EXPENSE : COLORS.INCOME }}>
                                  {budgetComparison.operatingExpenses.variancePercent >= 0 ? '+' : ''}{budgetComparison.operatingExpenses.variancePercent.toFixed(1)}%
                                </span>
                              </li>
                            </>
                          )}
                          {!qoqGrowth && !yoyGrowth && !budgetComparison && (
                            <li className="profit-loss-panel__growth-item" style={{ color: '#777' }}>
                              No data
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                  <div className="profit-loss-panel__kpi-rows">
                <div className="profit-loss-panel__kpi-row">
                  <div>
                    <div className="profit-loss-panel__label">Revenue</div>
                    <motion.div
                      key={financialData!.revenue}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="profit-loss-panel__value"
                      style={{ color: COLORS.INCOME }}
                    >
                      ${financialData!.revenue.toLocaleString()}
                    </motion.div>
                  </div>
                </div>

                <div className="profit-loss-panel__kpi-row">
                  <div>
                    <div className="profit-loss-panel__label">Net Income</div>
                    <motion.div
                      key={financialData!.netIncome}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="profit-loss-panel__value"
                      style={{ color: financialData!.netIncome >= 0 ? COLORS.PRIMARY : COLORS.EXPENSE }}
                    >
                      ${financialData!.netIncome.toLocaleString()}
                    </motion.div>
                  </div>
                </div>

                <div className="profit-loss-panel__kpi-row">
                  <div>
                    <div className="profit-loss-panel__label">YTD Net</div>
                    <motion.div
                      key={ytdData?.netIncome}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="profit-loss-panel__value"
                      style={{ color: ytdData?.netIncome && ytdData.netIncome >= 0 ? COLORS.PRIMARY : COLORS.EXPENSE }}
                    >
                      ${ytdData?.netIncome.toLocaleString() || '–'}
                    </motion.div>
                  </div>
                </div>

                <div className="profit-loss-panel__kpi-row">
                  <div>
                    <div className="profit-loss-panel__label">Margin</div>
                    <motion.div
                      key={ytdData?.marginPercentage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="profit-loss-panel__value"
                      style={{ color: ytdData?.netIncome && ytdData.netIncome >= 0 ? COLORS.PRIMARY : COLORS.EXPENSE }}
                    >
                      {ytdData ? ytdData.marginPercentage.toFixed(1) + '%' : '–'}
                    </motion.div>
                  </div>
                </div>
                  </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Html>

      <Html
        position={[-9.0, -0.75, 1]}
        transform
        style={{ width: '320px', height: '300px', overflowY: 'auto', fontSize: '0.9rem' }}
        className="statement-detail__container"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="statement-detail__line-items"
        >
          <h4 style={{ textAlign: 'center' }}>Category Totals</h4>
          {Object.keys(selectedStatement.lineItems).length === 0 ? (
            <p style={{ textAlign: 'center' }}>No categories found</p>
          ) : (
            selectedStatement.lineItems.map((item, i) => {
              const categoryName = item.category?.name || `Category ${item.category.id}`;
              const amount = parseFloat(item.amount || '0');
              return (
                <motion.div
                  key={i}
                  variants={itemVariants} 
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}
                >
                  <span>{categoryName}</span>
                  <span>${amount.toLocaleString()}</span>
                </motion.div>
              );
          })
          )}
        </motion.div>
      </Html>

      <group position={[-8.9, 5.5, 1.0]} scale={0.9}>
        <LineChart
          position={[0, 0, 0]}
          width={8}
          height={3}
          data={[
            { name: 'Revenue', values: recentStatements.map(s => parseFloat(s.revenue)), color: COLORS.INCOME },
          { name: 'Net Income', values: recentStatements.map(s => parseFloat(s.netIncome || '0')), color: financialData!.netIncome >= 0 ? COLORS.PRIMARY : COLORS.EXPENSE },
          ]}
          labels={recentStatements.map(s => s.periodName.slice(0, 3))}
        />
      </group>

      <group>
        <AnimatePresence mode="wait">
          <ProfitabilityTrend
            position={[-0.2, -5.36, 0]}
            statements={statements}
            selectedPeriodName={selectedStatement?.periodName || null}
          />
        </AnimatePresence>
      </group>

      <group scale={0.9}>
        <AnimatePresence mode="wait">
          {rollingData.labels.length > 1 && (
            <RollingYearChart
              key={selectedStatement.id}
              data={rollingData}
              width={8}
              height={3}
              position={[0.65, 6.0, 1]}
            />
          )}
        </AnimatePresence>
      </group>

      <Html
        transform
        position={[10.5, 0, 0]}
        style={{ width: '400px', height: '640px' }}
        className="statement-list-wrapper"
      >
        <StatementList
          statements={statements}
          filteredStatements={filteredStatements}
          onSelect={setSelectedStatement}
          onHover={() => {}}
          filters={filters}
          setFilters={setFilters}
          setShowFormModal={setShowForm}
        />
      </Html>
          </group>
        </>
      )}
    </group>
  );
}
