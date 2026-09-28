// src/components/ProfitLoss/ProfitabilityTrend.tsx
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import './ProfitabilityTrend.scss';
import type { ProfitLossStatement } from '../profitLoss';

interface IProps {
  statements: ProfitLossStatement[];
  selectedPeriodName: string | null;
  position: [number, number, number];
}

export default function ProfitabilityTrend({
  statements,
  selectedPeriodName,
  position,
}: IProps) {
  const sortedStatements = [...statements]
    .filter((s) => !s.isForecast)
    .sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime())
    .slice(-6); 

  if (sortedStatements.length === 0) {
    return (
      <Html position={position} style={{ width: '100%', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="profitability-trend__empty"
        >
          No historical data available
        </motion.div>
      </Html>
    );
  }

  const maxRevenue = Math.max(...sortedStatements.map((s) => parseFloat(s.revenue)));
  const maxNetIncome = Math.max(
    ...sortedStatements.map((s) => parseFloat(s.netIncome || '0'))
  );
  const maxValue = Math.max(maxRevenue, maxNetIncome);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Html position={position} style={{ width: '360px', height: '240px' }} transform scale={1.0}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="profitability-trend__container"
      >
        <h4 className="profitability-trend__title">Profitability Trend (Last 6 Quarters)</h4>

        <div className="profitability-trend__chart">
          {sortedStatements.map((stmt, _) => {
            const revenue = parseFloat(stmt.revenue);
            const netIncome = parseFloat(stmt.netIncome || '0');
            const margin = stmt.marginPercentage
              ? parseFloat(stmt.marginPercentage)
              : (netIncome / revenue) * 100;

            const widthRevenue = (revenue / maxValue) * 100;
            const widthNetIncome = (netIncome / maxValue) * 100;

            const isSelected = stmt.periodName === selectedPeriodName;

            return (
              <div key={stmt.id} className="profitability-trend__item">
                <div className="profitability-trend__period">{stmt.periodName}</div>

                <div
                  className={`profitability-trend__bar profitability-trend__bar--revenue ${
                    isSelected ? 'selected' : ''
                  }`}
                  style={{ width: `${widthRevenue}%` }}
                  title={`Revenue: $${formatCurrency(revenue)}`}
                />

                <div
                  className={`profitability-trend__bar profitability-trend__bar--net-income ${
                    isSelected ? 'selected' : ''
                  }`}
                  style={{ width: `${widthNetIncome}%` }}
                  title={`Net Income: $${formatCurrency(netIncome)}`}
                />

                <div
                  className="profitability-trend__margin-label"
                  style={{
                    left: `${widthNetIncome + 5}%`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {margin.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="profitability-trend__legend">
          <span className="legend-item">
            <span className="legend-color-box revenue" /> Revenue
          </span>
          <span className="legend-item">
            <span className="legend-color-box net-income" /> Net Income
          </span>
          <span className="legend-item">
            <span className="legend-color-box margin" /> Margin %
          </span>
        </div>
      </motion.div>
    </Html>
  );
}
