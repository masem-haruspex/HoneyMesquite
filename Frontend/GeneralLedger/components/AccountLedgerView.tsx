// components/AccountLedgerView.tsx
import { useState } from 'react';
import type { Account, JournalEntry } from '../generalLedger';
import './AccountLedgerView.scss';

interface AccountLedgerViewProps {
  account: Account;
  journalEntries: JournalEntry[];
  onBack: () => void;
}

export default function AccountLedgerView({ account, journalEntries, onBack }: AccountLedgerViewProps) {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const filteredEntries = journalEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
  });

  const calculateRunningBalance = () => {
    let balance = 0;
    const entriesWithBalance = filteredEntries.map(entry => {
      if (account.normalBalance === 'DEBIT') {
        balance += entry.debitAmount - entry.creditAmount;
      } else {
        balance += entry.creditAmount - entry.debitAmount;
      }
      return { ...entry, runningBalance: balance };
    });
    return entriesWithBalance;
  };

  const entriesWithBalance = calculateRunningBalance();
  const currentBalance = entriesWithBalance.length > 0 
    ? entriesWithBalance[entriesWithBalance.length - 1].runningBalance 
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="account-ledger-container">
      <div className="ledger-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Accounts
        </button>
        <div className="account-info">
          <h3>{account.code} - {account.name}</h3>
          <div className="account-meta">
            <span className={`type-badge ${account.type.toLowerCase()}`}>
              {account.type}
            </span>
            <span className={`normal-balance ${account.normalBalance.toLowerCase()}`}>
              Normal Balance: {account.normalBalance}
            </span>
            <span className={`status ${account.isActive ? 'active' : 'inactive'}`}>
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="ledger-controls">
        <div className="date-filters">
          <div className="date-group">
            <label>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-group">
            <label>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button 
            className="reset-btn"
            onClick={() => {
              setStartDate(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}
          >
            Reset
          </button>
        </div>
        <div className="balance-summary">
          <div className="summary-item">
            <span className="summary-label">Current Balance:</span>
            <span className={`summary-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
              ${Math.abs(currentBalance).toLocaleString()}
              <span className="balance-type">
                {currentBalance >= 0 ? 
                  (account.normalBalance === 'DEBIT' ? ' DR' : ' CR') :
                  (account.normalBalance === 'DEBIT' ? ' CR' : ' DR')}
              </span>
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Entries in Period:</span>
            <span className="summary-value count">
              {filteredEntries.length}
            </span>
          </div>
        </div>
      </div>

      <div className="ledger-table">
        <div className="table-header">
          <div className="header-cell">Date</div>
          <div className="header-cell">Entry #</div>
          <div className="header-cell">Description</div>
          <div className="header-cell">Reference</div>
          <div className="header-cell">Debit</div>
          <div className="header-cell">Credit</div>
          <div className="header-cell">Balance</div>
          <div className="header-cell">Status</div>
        </div>

        <div className="table-body">
          {entriesWithBalance.length > 0 ? (
            entriesWithBalance.map(entry => (
              <div key={entry.id} className="table-row">
                <div className="table-cell date">
                  {formatDate(entry.date)}
                </div>
                <div className="table-cell entry-number">
                  {entry.journalEntryNumber}
                </div>
                <div className="table-cell description">
                  {entry.description}
                </div>
                <div className="table-cell reference">
                  {entry.referenceNumber || '-'}
                </div>
                <div className="table-cell debit">
                  {entry.debitAmount > 0 ? `$${entry.debitAmount.toLocaleString()}` : '-'}
                </div>
                <div className="table-cell credit">
                  {entry.creditAmount > 0 ? `$${entry.creditAmount.toLocaleString()}` : '-'}
                </div>
                <div className="table-cell balance">
                  <span className={`balance-amount ${
                    entry.runningBalance >= 0 ? 'positive' : 'negative'
                  }`}>
                    ${Math.abs(entry.runningBalance).toLocaleString()}
                    <span className="balance-type">
                      {entry.runningBalance >= 0 ? 
                        (account.normalBalance === 'DEBIT' ? ' DR' : ' CR') :
                        (account.normalBalance === 'DEBIT' ? ' CR' : ' DR')}
                    </span>
                  </span>
                </div>
                <div className="table-cell status">
                  <span className={`status-badge ${entry.status.toLowerCase()}`}>
                    {entry.status}
                  </span>
                  {entry.reconciled && (
                    <span className="reconciled-badge">✓</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-row">
              No journal entries found for this period.
            </div>
          )}
        </div>
      </div>

      <div className="ledger-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-label">Total Debits:</span>
            <span className="stat-value">
              ${filteredEntries.reduce((sum, entry) => sum + entry.debitAmount, 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Credits:</span>
            <span className="stat-value">
              ${filteredEntries.reduce((sum, entry) => sum + entry.creditAmount, 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Net Activity:</span>
            <span className={`stat-value ${
              filteredEntries.reduce((sum, entry) => sum + entry.debitAmount - entry.creditAmount, 0) >= 0 
                ? 'positive' 
                : 'negative'
            }`}>
              ${Math.abs(filteredEntries.reduce((sum, entry) => sum + entry.debitAmount - entry.creditAmount, 0)).toLocaleString()}
            </span>
          </div>
        </div>
        <button 
          className="export-btn"
          onClick={() => {
            console.log('Export ledger for account:', account.code);
          }}
        >
          Export Ledger
        </button>
      </div>
    </div>
  );
}
