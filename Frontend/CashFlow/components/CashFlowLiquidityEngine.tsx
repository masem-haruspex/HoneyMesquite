// CashFlowLiquidityEngine.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { VictoryPie, VictoryAnimation } from 'victory';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import { COLORS } from '../../colors';
import './CashFlowLiquidityEngine.scss';
import '../../scss/glow.scss';

interface LiquidityEvent {
  date: Date;
  cashIn: number;
  cashOut: number;
  netFlow: number;
  balance: number;
  criticalAccounts?: {
    name: string;
    balance: number;
    minThreshold: number;
  }[];
}

interface CashFlowLiquidityEngineProps {
  data: LiquidityEvent[];
  thresholds: {
    warning: number;
    critical: number;
  };
  onDateRangeChange: (range: '1m' | '3m' | '6m' | '12m') => void;
  onAccountSelect: (account: string | null) => void;
}

const LiquidityChart = ({ data }: { data: LiquidityEvent[] }) => {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        date: d.date.getTime(),
        formattedDate: timeFormat('%Y-%m-%d')(d.date),
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.PRIMARY} opacity={0.3} />
        <XAxis
          dataKey="date"
          tick={{ fill: COLORS.PRIMARY }}
          tickFormatter={(unixTime) => timeFormat('%b %d')(new Date(unixTime))}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tick={{ fill: COLORS.PRIMARY }}
          tickFormatter={(value) => format('$.2s')(value)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: COLORS.PRIMARY }}
          tickFormatter={(value) => format('$.2s')(value)}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`]}
          labelFormatter={(label) => timeFormat('%Y-%m-%d')(new Date(label))}
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: COLORS.PRIMARY,
            borderRadius: '4px',
            color: COLORS.PRIMARY,
          }}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="balance"
          stroke={COLORS.PRIMARY}
          fill="rgba(70, 130, 180, 0.2)"
          strokeWidth={2}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="cashIn"
          stroke={COLORS.INCOME}
          fill="rgba(100, 200, 100, 0.2)"
          strokeWidth={2}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="cashOut"
          stroke={COLORS.EXPENSE}
          fill="rgba(200, 100, 100, 0.2)"
          strokeWidth={2}
        />
        <ReferenceLine yAxisId="left" y={0} stroke={COLORS.EXPENSE} strokeDasharray="3 3" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const LiquidityGauge = ({
  value,
  min,
  max,
  thresholds,
}: {
  value: number;
  min: number;
  max: number;
  thresholds: { warning: number; critical: number };
}) => {
  const normalizedValue = ((value - min) / (max - min)) * 100;
  const isCritical = value < thresholds.critical;
  const isWarning = value < thresholds.warning && !isCritical;

  return (
    <div className="liquidity-gauge">
      <svg viewBox="0 0 200 200">
        <VictoryPie
          standalone={false}
          animate={{ duration: 1000 }}
          width={200}
          height={200}
          data={[
            { x: 1, y: normalizedValue },
            { x: 2, y: 100 - normalizedValue },
          ]}
          innerRadius={70}
          cornerRadius={10}
          labels={() => null}
          style={{
            data: {
              fill: ({ datum }) =>
                datum.x === 1
                  ? isCritical
                    ? COLORS.EXPENSE
                    : isWarning
                      ? COLORS.WARNING
                      : COLORS.INCOME
                  : 'rgba(70, 130, 180, 0.2)',
            },
          }}
        />
        <VictoryAnimation data={{ value: normalizedValue }}>
          {(_) => (
            <text
              x="100"
              y="100"
              textAnchor="middle"
              fill={COLORS.PRIMARY}
              fontSize="24"
              dy=".3em"
            >
              ${value.toLocaleString()}
            </text>
          )}
        </VictoryAnimation>
        <text x="100" y="130" textAnchor="middle" fill={COLORS.PRIMARY} fontSize="16">
          Liquidity
        </text>
      </svg>
      <div className="gauge-thresholds">
        <div
          className="threshold critical"
          style={{ bottom: `${(thresholds.critical / max) * 100}%` }}
        >
          ${thresholds.critical.toLocaleString()}
        </div>
        <div
          className="threshold warning"
          style={{ bottom: `${(thresholds.warning / max) * 100}%` }}
        >
          ${thresholds.warning.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const AccountStatusList = ({
  accounts,
  onSelect,
}: {
  accounts: LiquidityEvent['criticalAccounts'];
  onSelect: (account: string) => void;
}) => {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="empty-accounts">No critical accounts</div>
    );
  }

  return (
    <div className="account-list">
      {accounts.map((account, index) => {
        const percent = (account.balance / account.minThreshold) * 100;
        const isCritical = percent < 50;
        const isWarning = percent < 100 && !isCritical;

        return (
          <motion.div
            key={account.name}
            className={`account-item ${isCritical ? 'critical' : isWarning ? 'warning' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(account.name)}
          >
            <div className="account-name">{account.name}</div>
            <div className="account-balance">
              ${account.balance.toLocaleString()}
              <span className="account-threshold"> / ${account.minThreshold.toLocaleString()}</span>
            </div>
            <div className="account-progress">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(percent, 100)}%`,
                  backgroundColor: isCritical
                    ? COLORS.EXPENSE
                    : isWarning
                      ? COLORS.WARNING
                      : COLORS.INCOME,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const CashFlowLiquidityEngine = React.memo((props: CashFlowLiquidityEngineProps) => {
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '12m'>('3m');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth - 40,
          height: Math.min(containerRef.current.offsetHeight * 0.6, 500),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '12m':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return props.data.filter((d) => d.date >= cutoffDate);
  }, [props.data, timeRange]);

  const latestData = useMemo(() => filteredData[filteredData.length - 1], [filteredData]);

  const minBalance = useMemo(() => Math.min(...filteredData.map((d) => d.balance)), [filteredData]);
  const maxBalance = useMemo(() => Math.max(...filteredData.map((d) => d.balance)), [filteredData]);

  const handleTimeRangeChange = (range: '1m' | '3m' | '6m' | '12m') => {
    setTimeRange(range);
    props.onDateRangeChange(range);
  };

  const handleAccountSelect = (account: string) => {
    const next = account === selectedAccount ? null : account;
    setSelectedAccount(next);
    props.onAccountSelect(next);
  };

  const selectedAccountData = useMemo(() => {
    if (!latestData?.criticalAccounts || !selectedAccount) return null;
    return latestData.criticalAccounts.find((a) => a.name === selectedAccount);
  }, [latestData, selectedAccount]);

  return (
    <div
      className="cash-flow-liquidity-engine"
      ref={containerRef}
    >
      <div className="header" >
        <h1 >LIQUIDITY ENGINE</h1>

        <div className="time-range-selector" >
          {(['1m', '3m', '6m', '12m'] as const).map((range) => (
            <motion.button
              key={range}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTimeRangeChange(range)}
              style={{
                borderColor: timeRange === range ? COLORS.PRIMARY : 'rgba(0, 0, 0, 0)',
                background: timeRange === range ? COLORS.PRIMARY :  'rgba(0, 0, 0, 0)',
                color: timeRange === range ? '#000' : COLORS.PRIMARY,
              }}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="metrics-row" >
        <motion.div className="metric-card" whileHover={{ y: -5 }}>
          <div className="metric-label">Current Balance</div>
          <div className="metric-value">${latestData?.balance.toLocaleString() || '0'}</div>
          <div className="metric-trend">
            {latestData?.netFlow != null && (latestData.netFlow >= 0 ? '↑' : '↓')}
            {latestData?.netFlow ? ` $${Math.abs(latestData.netFlow).toLocaleString()}` : ''}
          </div>
        </motion.div>

        <motion.div className="metric-card" whileHover={{ y: -5 }} >
          <div className="metric-label">30-Day Outflow</div>
          <div className="metric-value">
            ${filteredData.reduce((sum, d) => sum + d.cashOut, 0).toLocaleString()}
          </div>
          <div className="metric-subtext">Total obligations</div>
        </motion.div>

        <motion.div className="metric-card" whileHover={{ y: -5 }}>
          <div className="metric-label">30-Day Inflow</div>
          <div className="metric-value">
            ${filteredData.reduce((sum, d) => sum + d.cashIn, 0).toLocaleString()}
          </div>
          <div className="metric-subtext">Total receipts</div>
        </motion.div>

        <div className="liquidity-gauge-container" style={{ flex: '1', minWidth: '200px' }}>
          {latestData && (
            <LiquidityGauge
              value={latestData.balance}
              min={minBalance}
              max={maxBalance}
              thresholds={props.thresholds}
            />
          )}
        </div>
      </div>

      <div className="chart-container" style={{ height: `${dimensions.height}px`, marginBottom: '20px' }}>
        {filteredData.length > 0 && <LiquidityChart data={filteredData} />}
      </div>

      <div className="account-status">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Critical Accounts</h3>
          {selectedAccount && (
            <button className="clear-selection" onClick={() => handleAccountSelect(selectedAccount)} style={{ background: 'none', border: 'none', color: COLORS.WARNING, cursor: 'pointer' }}>
              Clear Selection
            </button>
          )}
        </div>
        <AccountStatusList accounts={latestData?.criticalAccounts} onSelect={handleAccountSelect} />
      </div>

      <AnimatePresence>
        {selectedAccountData && (
          <motion.div
            className="account-detail-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              border: `1px solid ${COLORS.PRIMARY}`,
              borderRadius: '8px',
              padding: '20px',
              width: '300px',
              zIndex: 10,
              color: COLORS.PRIMARY,
            }}
          >
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h4>{selectedAccount} Details</h4>
              <button
                className="close-btn"
                onClick={() => handleAccountSelect(selectedAccount!)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <div className="panel-content">
              <div className="account-metric">
                <div className="label">Current Balance</div>
                <div className="value">${selectedAccountData.balance.toLocaleString()}</div>
              </div>
              <div className="account-metric">
                <div className="label">Minimum Threshold</div>
                <div className="value">${selectedAccountData.minThreshold.toLocaleString()}</div>
              </div>
              <div className="account-metric">
                <div className="label">Buffer</div>
                <div className="value">
                  {selectedAccountData.balance >= selectedAccountData.minThreshold ? '+' : '-'}
                  ${Math.abs(selectedAccountData.balance - selectedAccountData.minThreshold).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default CashFlowLiquidityEngine;
