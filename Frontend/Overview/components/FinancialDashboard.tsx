// Overview/components/FinancialDashboard.tsx
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { COLORS } from '../../colors';
import { 
  cashFlowDataAtom, 
  receivablesDataAtom, 
  departmentsDataAtom, 
  profitLossDataAtom, 
  budgetsDataAtom, 
  vendorsDataAtom 
} from '../../atoms/dataAtoms';
import './FinancialDashboard.scss';
import type { AccountsReceivable } from '../../Receivables/receivable';
import type { Department } from '../../Departments/department';
import {  liquidityAtom } from '../../CashFlow/CashFlow';

interface DashboardMetric {
  label: string;
  value: string;
  change: number;
  color: string;
  icon: string;
}

export default function FinancialDashboard() {
  const [cashFlowData] = useAtom(cashFlowDataAtom);
  const [receivablesData] = useAtom(receivablesDataAtom);
  const [departmentsData] = useAtom(departmentsDataAtom);
  const [profitLossData] = useAtom(profitLossDataAtom);
  const [budgetsData] = useAtom(budgetsDataAtom);
  const [vendorsData] = useAtom(vendorsDataAtom);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [liquidityData] = useAtom(liquidityAtom);

  useEffect(() => {
    calculateMetrics();
  }, [cashFlowData, receivablesData, departmentsData, profitLossData, budgetsData, vendorsData]);

  const calculateMetrics = () => {
  setLoading(true);

  try {
    const newMetrics: DashboardMetric[] = [];

    const totalCash = liquidityData.length > 0
  ? liquidityData[liquidityData.length - 1].balance  
  : 0;
    newMetrics.push({
      label: 'Cash Balance',
      value: formatCurrency(totalCash),
      change: 12.5,
      color: COLORS.INCOME,
      icon: '💰'
    });

    const totalReceivables = Array.isArray(receivablesData)
      ? receivablesData.reduce((sum: number, item: AccountsReceivable) => {
          return sum + (item.amount || 0);
        }, 0)
      : 0;

    const overdueReceivables = Array.isArray(receivablesData)
      ? receivablesData.filter(r => (r.daysLate || 0) > 30)
          .reduce((sum: number, item: AccountsReceivable) => sum + (item.amount || 0), 0)
      : 0;

    newMetrics.push({
      label: 'Receivables',
      value: formatCurrency(totalReceivables),
      change: overdueReceivables > 0 ? -8.2 : 5.3,
      color: overdueReceivables > 0 ? COLORS.WARNING : COLORS.INCOME,
      icon: '📥'
    });

    const netIncome = Array.isArray(profitLossData) && profitLossData.length > 0
      ? parseFloat(profitLossData[profitLossData.length - 1]?.netIncome || '0')
      : 0;

    newMetrics.push({
      label: 'Net Income',
      value: formatCurrency(netIncome),
      change: netIncome >= 0 ? 15.7 : -12.3,
      color: netIncome >= 0 ? COLORS.INCOME : COLORS.EXPENSE,
      icon: '📈'
    });

    let totalBudget = 0;
    let totalSpent = 0;

    if (Array.isArray(budgetsData) && budgetsData.length > 0) {
      totalBudget = budgetsData.reduce((sum: number, item: any) => {
        return sum + (item.budgetedAmount || 0);
      }, 0);

      totalSpent = budgetsData.reduce((sum: number, item: any) => {
        const actual = item.actualAmount || (item.budgetedAmount * (0.7 + Math.random() * 0.3));
        return sum + actual;
      }, 0);
    }

    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    newMetrics.push({
      label: 'Budget Utilization',
      value: `${utilizationRate.toFixed(1)}%`,
      change: utilizationRate > 90 ? 8.5 : -3.2,
      color: utilizationRate > 90 ? COLORS.WARNING : COLORS.INCOME,
      icon: '💰'
    });

    let totalVendorSpend = 0;
    if (Array.isArray(vendorsData) && vendorsData.length > 0) {
      totalVendorSpend = vendorsData.reduce((sum: number, vendor: any) => {
        if (vendor.contracts && Array.isArray(vendor.contracts)) {
          const contractSum = vendor.contracts.reduce((s: number, c: any) => {
            return s + (parseFloat(c.contractedRate) || 0);
          }, 0);
          return sum + contractSum;
        }
        return sum + (parseFloat(vendor.contractedRate) || 0);
      }, 0);
    }
    newMetrics.push({
      label: 'Vendor Spend',
      value: formatCurrency(totalVendorSpend),
      change: -4.7,
      color: COLORS.EXPENSE,
      icon: '🏭'
    });

    const avgEfficiency = Array.isArray(departmentsData) && departmentsData.length > 0
      ? departmentsData.reduce((sum: number, dept: Department) => sum + (dept.currentEfficiency || 0), 0) / departmentsData.length
      : 0;

    newMetrics.push({
      label: 'Avg Efficiency',
      value: `${avgEfficiency.toFixed(1)}%`,
      change: 2.3,
      color: avgEfficiency > 80 ? COLORS.INCOME : COLORS.WARNING,
      icon: '⚡'
    });

    setMetrics(newMetrics);
  } catch (error) {
    console.error('Error calculating dashboard metrics:', error);
  } finally {
    setLoading(false);
  }
};

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(1)}B`;
    } else if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(1)}M`;
    } else if (amount >= 1e3) {
      return `$${(amount / 1e3).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatChange = (change: number): string => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <div>Calculating dashboard metrics...</div>
      </div>
    );
  }

  return (
    <div className="financial-dashboard">
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-label">{metric.label}</span>
            </div>
            <div className="metric-value" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="metric-change" style={{ color: metric.change >= 0 ? COLORS.INCOME : COLORS.EXPENSE }}>
              {formatChange(metric.change)}
              <span className="change-arrow">
                {metric.change >= 0 ? '↗' : '↘'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="alerts-section">
        <h3>Financial Alerts</h3>
        <div className="alerts-list">
          {generateAlerts().map((alert, index) => (
            <div key={index} className={`alert-item ${alert.severity}`}>
              <span className="alert-icon">{alert.icon}</span>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-message">{alert.message}</div>
              </div>
              <span className="alert-time">{alert.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-button">
            <span className="action-icon">📊</span>
            <span className="action-label">View Reports</span>
          </button>
          <button className="action-button">
            <span className="action-icon">💰</span>
            <span className="action-label">Add Budget</span>
          </button>
          <button className="action-button">
            <span className="action-icon">📋</span>
            <span className="action-label">Run Forecast</span>
          </button>
          <button className="action-button">
            <span className="action-icon">📈</span>
            <span className="action-label">Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function generateAlerts() {
  return [
    {
      icon: '⚠️',
      title: 'Budget Overrun',
      message: 'Marketing department exceeded budget by 15%',
      severity: 'warning',
      time: '2 hours ago'
    },
    {
      icon: '💰',
      title: 'Cash Low',
      message: 'Operating account below minimum threshold',
      severity: 'critical',
      time: '5 hours ago'
    },
    {
      icon: '📥',
      title: 'Large Payment Received',
      message: '$250,000 payment from Client XYZ',
      severity: 'positive',
      time: '1 day ago'
    },
    {
      icon: '📊',
      title: 'Monthly Report Ready',
      message: 'Financial statements for October available',
      severity: 'info',
      time: '2 days ago'
    }
  ];
}
