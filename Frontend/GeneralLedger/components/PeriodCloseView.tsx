// components/PeriodCloseView.tsx
import { useState } from 'react';
import { COLORS } from '../../colors';
import type { AccountingPeriod } from '../generalLedger';
import './PeriodCloseView.scss';

interface PeriodCloseViewProps {
  accountingPeriods: AccountingPeriod[];
  onClosePeriod: (periodId: number) => Promise<void>;
}

export default function PeriodCloseView({ accountingPeriods, onClosePeriod }: PeriodCloseViewProps) {
  const [closingPeriod, setClosingPeriod] = useState<AccountingPeriod | null>(null);
  const [closeConfirmation, setCloseConfirmation] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleClosePeriod = async (period: AccountingPeriod) => {
    setClosingPeriod(period);
    setCloseConfirmation(true);
  };

  const confirmClosePeriod = async () => {
    if (closingPeriod) {
      try {
        await onClosePeriod(closingPeriod.id);
        setCloseConfirmation(false);
        setClosingPeriod(null);
      } catch (error) {
        console.error('Error closing period:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return COLORS.INCOME;
      case 'CLOSED': return COLORS.WARNING;
      case 'LOCKED': return COLORS.CRITICAL;
      default: return COLORS.MUTED;
    }
  };

  return (
    <div className="period-close-container">
      <div className="period-close-header">
        <h3>Accounting Periods</h3>
        <div className="header-info">
          <span>Current Period: {
            accountingPeriods.find(p => p.status === 'OPEN')?.periodName || 'None'
          }</span>
          <button className="new-period-btn">
            + New Period
          </button>
        </div>
      </div>

      {closeConfirmation && closingPeriod && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h4>Close Accounting Period</h4>
            <div className="confirmation-content">
              <p>
                Are you sure you want to close period <strong>{closingPeriod.periodName}</strong>?
              </p>
              <div className="period-details">
                <div className="detail-item">
                  <span className="detail-label">Period:</span>
                  <span className="detail-value">{closingPeriod.periodName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Dates:</span>
                  <span className="detail-value">
                    {formatDate(closingPeriod.periodStart)} to {formatDate(closingPeriod.periodEnd)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{closingPeriod.periodType}</span>
                </div>
              </div>
              <div className="warning-message">
                <p>⚠️ Once closed, this period cannot be reopened without administrator access.</p>
                <p>Make sure all transactions for this period are posted and reconciled.</p>
              </div>
            </div>
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setCloseConfirmation(false);
                  setClosingPeriod(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmClosePeriod}
              >
                Close Period
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="periods-list">
        <div className="periods-table-header">
          <div className="header-cell">Period Name</div>
          <div className="header-cell">Dates</div>
          <div className="header-cell">Type</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Closed By</div>
          <div className="header-cell">Closed Date</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="periods-table-body">
          {accountingPeriods.map(period => (
            <div key={period.id} className="period-row">
              <div className="period-cell name">
                <strong>{period.periodName}</strong>
              </div>
              <div className="period-cell dates">
                {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
              </div>
              <div className="period-cell type">
                {period.periodType}
              </div>
              <div className="period-cell status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(period.status) }}
                >
                  {period.status}
                </span>
              </div>
              <div className="period-cell closed-by">
                {period.closedBy || '-'}
              </div>
              <div className="period-cell closed-date">
                {period.closedAt ? formatDate(period.closedAt) : '-'}
              </div>
              <div className="period-cell actions">
                {period.status === 'OPEN' && (
                  <button 
                    className="close-btn"
                    onClick={() => handleClosePeriod(period)}
                  >
                    Close Period
                  </button>
                )}
                {period.status === 'CLOSED' && (
                  <button 
                    className="lock-btn"
                    onClick={() => {
                      console.log('Lock period:', period.id);
                    }}
                  >
                    Lock
                  </button>
                )}
                {period.status === 'LOCKED' && (
                  <span className="locked-text">Locked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="closing-checklist">
        <h4>Period Closing Checklist</h4>
        <div className="checklist-items">
          <div className="checklist-item">
            <input type="checkbox" id="check1" />
            <label htmlFor="check1">All transactions for the period are posted</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check2" />
            <label htmlFor="check2">All bank accounts are reconciled</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check3" />
            <label htmlFor="check3">Accounts receivable are up to date</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check4" />
            <label htmlFor="check4">Accounts payable are up to date</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check5" />
            <label htmlFor="check5">Depreciation is calculated</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check6" />
            <label htmlFor="check6">Trial balance is balanced</label>
          </div>
          <div className="checklist-item">
            <input type="checkbox" id="check7" />
            <label htmlFor="check7">Financial statements are reviewed</label>
          </div>
        </div>
      </div>

      <div className="period-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Open Periods:</span>
            <span className="stat-value">
              {accountingPeriods.filter(p => p.status === 'OPEN').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Closed Periods:</span>
            <span className="stat-value">
              {accountingPeriods.filter(p => p.status === 'CLOSED').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Locked Periods:</span>
            <span className="stat-value">
              {accountingPeriods.filter(p => p.status === 'LOCKED').length}
            </span>
          </div>
        </div>
        <div className="summary-actions">
          <button className="reports-btn">
            Generate Closing Reports
          </button>
          <button className="audit-btn">
            Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
