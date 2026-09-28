// components/TrialBalanceView.tsx
import { useState } from 'react';
import type { TrialBalanceItem } from '../generalLedger';
import './TrialBalanceView.scss';

interface TrialBalanceViewProps {
  trialBalance: TrialBalanceItem[];
  onAccountSelect: (accountCode: string) => void;
}

export default function TrialBalanceView({ trialBalance, onAccountSelect }: TrialBalanceViewProps) {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = trialBalance.filter(item => {
    if (filter === 'debit' && item.balance >= 0) return false;
    if (filter === 'credit' && item.balance < 0) return false;
    if (searchTerm && !item.accountName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.accountCode.includes(searchTerm)) return false;
    return true;
  });

  const totalDebits = filteredItems.reduce((sum, item) => sum + item.totalDebits, 0);
  const totalCredits = filteredItems.reduce((sum, item) => sum + item.totalCredits, 0);
  const netBalance = Math.abs(filteredItems.reduce((sum, item) => sum + item.balance, 0));

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="trial-balance-container">
      <div className="trial-balance-header">
        <h3>Trial Balance</h3>
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'debit' ? 'active' : ''}`}
              onClick={() => setFilter('debit')}
            >
              Debit Balances
            </button>
            <button 
              className={`filter-btn ${filter === 'credit' ? 'active' : ''}`}
              onClick={() => setFilter('credit')}
            >
              Credit Balances
            </button>
          </div>
        </div>
      </div>

      <div className="balance-summary">
        <div className="summary-item">
          <span className="summary-label">Total Debits:</span>
          <span className="summary-value debit">
            ${totalDebits.toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Credits:</span>
          <span className="summary-value credit">
            ${totalCredits.toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Net Difference:</span>
          <span className={`summary-value ${isBalanced ? 'balanced' : 'unbalanced'}`}>
            ${netBalance.toFixed(2)}
            {!isBalanced && ' (Unbalanced)'}
          </span>
        </div>
      </div>

      <div className="trial-balance-table">
        <div className="table-header">
          <div className="header-cell">Account Code</div>
          <div className="header-cell">Account Name</div>
          <div className="header-cell">Type</div>
          <div className="header-cell">Total Debits</div>
          <div className="header-cell">Total Credits</div>
          <div className="header-cell">Balance</div>
        </div>

        <div className="table-body">
          {filteredItems.map(item => (
            <div 
              key={item.accountCode}
              className="table-row"
              onClick={() => onAccountSelect(item.accountCode)}
            >
              <div className="table-cell code">
                {item.accountCode}
              </div>
              <div className="table-cell name">
                {item.accountName}
              </div>
              <div className="table-cell type">
                <span className={`type-badge ${item.type.toLowerCase()}`}>
                  {item.type}
                </span>
              </div>
              <div className="table-cell debit">
                ${item.totalDebits.toLocaleString()}
              </div>
              <div className="table-cell credit">
                ${item.totalCredits.toLocaleString()}
              </div>
              <div className="table-cell balance">
                <span className={`balance-amount ${item.balance >= 0 ? 'debit' : 'credit'}`}>
                  ${Math.abs(item.balance).toLocaleString()}
                  <span className="balance-type">
                    {item.balance >= 0 ? ' DR' : ' CR'}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          No accounts found matching your criteria.
        </div>
      )}

      <div className="trial-balance-footer">
        <div className="footer-info">
          <span>Accounts: {filteredItems.length}</span>
          <span>|</span>
          <span>As of: {new Date().toLocaleDateString()}</span>
          {!isBalanced && (
            <>
              <span>|</span>
              <span className="warning">⚠️ Trial balance is not balanced</span>
            </>
          )}
        </div>
        <button 
          className="export-btn"
          onClick={() => {
            console.log('Export trial balance');
          }}
        >
          Export Report
        </button>
      </div>
    </div>
  );
}
