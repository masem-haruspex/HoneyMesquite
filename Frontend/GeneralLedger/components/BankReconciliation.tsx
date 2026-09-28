// components/BankReconciliation.tsx
import { useState } from 'react';
import type { BankAccount, BankStatement, JournalEntry } from '../generalLedger';
import './BankReconciliation.scss';

interface BankReconciliationProps {
  bankAccount: BankAccount;
  bankStatements: BankStatement[];
  journalEntries: JournalEntry[];
  onRefresh: () => Promise<void>;
}

export default function BankReconciliation({ 
  bankAccount, 
  bankStatements, 
  journalEntries,
  onRefresh 
}: BankReconciliationProps) {
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reconciliationInProgress, setReconciliationInProgress] = useState(false);

  const unreconciledEntries = journalEntries.filter(entry => 
    !entry.reconciled && entry.bankAccountId === bankAccount.id
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUploadStatement = async () => {
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    console.log('Uploading statement:', uploadFile);
    await onRefresh();
    setShowUpload(false);
    setUploadFile(null);
  };

  const startReconciliation = (statement: BankStatement) => {
    setSelectedStatement(statement);
    setReconciliationInProgress(true);
  };

  const completeReconciliation = () => {
    setReconciliationInProgress(false);
    setSelectedStatement(null);
    console.log('Completing reconciliation');
  };

  return (
    <div className="bank-reconciliation-container">
      <div className="reconciliation-header">
        <div className="bank-info">
          <h3>{bankAccount.name}</h3>
          <div className="bank-details">
            <span className="bank-number">{bankAccount.accountNumber}</span>
            <span className="bank-type">{bankAccount.accountType}</span>
            <span className="current-balance">
              Current Balance: {formatCurrency(bankAccount.currentBalance)}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="upload-btn"
            onClick={() => setShowUpload(true)}
          >
            Upload Statement
          </button>
          <button 
            className="refresh-btn"
            onClick={onRefresh}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="upload-overlay">
          <div className="upload-form">
            <h4>Upload Bank Statement</h4>
            <div className="form-group">
              <label>Statement File (CSV, OFX, QFX)</label>
              <input
                type="file"
                accept=".csv,.ofx,.qfx,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="form-group">
              <label>Statement Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowUpload(false);
                  setUploadFile(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="upload-btn"
                onClick={handleUploadStatement}
              >
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="reconciliation-content">
        <div className="statements-panel">
          <h4>Bank Statements</h4>
          <div className="statements-list">
            {bankStatements.map(statement => (
              <div 
                key={statement.id}
                className={`statement-item ${selectedStatement?.id === statement.id ? 'selected' : ''}`}
                onClick={() => setSelectedStatement(statement)}
              >
                <div className="statement-header">
                  <span className="statement-date">
                    {formatDate(statement.statementDate)}
                  </span>
                  <span className={`statement-status ${statement.status.toLowerCase()}`}>
                    {statement.status}
                  </span>
                </div>
                <div className="statement-details">
                  <div className="detail-item">
                    <span className="detail-label">Opening:</span>
                    <span className="detail-value">
                      {formatCurrency(statement.openingBalance)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Closing:</span>
                    <span className="detail-value">
                      {formatCurrency(statement.closingBalance)}
                    </span>
                  </div>
                </div>
                {statement.status === 'RECONCILED' ? (
                  <div className="reconciled-badge">
                    ✓ Reconciled
                  </div>
                ) : (
                  <button 
                    className="reconcile-btn"
                    onClick={() => startReconciliation(statement)}
                  >
                    Start Reconciliation
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="matching-panel">
          {reconciliationInProgress && selectedStatement ? (
            <div className="reconciliation-in-progress">
              <h4>Reconciliation in Progress</h4>
              <div className="reconciliation-summary">
                <div className="summary-row">
                  <span className="summary-label">Statement Balance:</span>
                  <span className="summary-value">
                    {formatCurrency(selectedStatement.closingBalance)}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Book Balance:</span>
                  <span className="summary-value">
                    {formatCurrency(bankAccount.currentBalance)}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Difference:</span>
                  <span className={`summary-value ${
                    Math.abs(selectedStatement.closingBalance - bankAccount.currentBalance) > 0.01
                      ? 'error' 
                      : 'success'
                  }`}>
                    {formatCurrency(selectedStatement.closingBalance - bankAccount.currentBalance)}
                  </span>
                </div>
              </div>

              <div className="unreconciled-items">
                <h5>Unreconciled Journal Entries</h5>
                <div className="items-list">
                  {unreconciledEntries.map(entry => (
                    <div key={entry.id} className="unreconciled-item">
                      <div className="item-header">
                        <span className="entry-date">{formatDate(entry.date)}</span>
                        <span className="entry-number">{entry.journalEntryNumber}</span>
                      </div>
                      <div className="item-details">
                        <span className="item-description">{entry.description}</span>
                        <span className={`item-amount ${
                          entry.debitAmount > 0 ? 'debit' : 'credit'
                        }`}>
                          {entry.debitAmount > 0 
                            ? `Debit: ${formatCurrency(entry.debitAmount)}`
                            : `Credit: ${formatCurrency(entry.creditAmount)}`}
                        </span>
                      </div>
                      <button className="match-btn">
                        Match to Statement
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reconciliation-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setReconciliationInProgress(false);
                    setSelectedStatement(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="complete-btn"
                  onClick={completeReconciliation}
                >
                  Complete Reconciliation
                </button>
              </div>
            </div>
          ) : (
            <div className="reconciliation-instructions">
              <h4>Bank Reconciliation</h4>
              <div className="instructions">
                <p>To reconcile your bank account:</p>
                <ol>
                  <li>Upload your bank statement (CSV, OFX, or QFX format)</li>
                  <li>Select a statement from the list</li>
                  <li>Match journal entries with statement lines</li>
                  <li>Review and complete the reconciliation</li>
                </ol>
              </div>
              <div className="current-status">
                <div className="status-item">
                  <span className="status-label">Unreconciled Entries:</span>
                  <span className="status-value">{unreconciledEntries.length}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Last Reconciled:</span>
                  <span className="status-value">
                    {bankAccount.lastReconciledDate 
                      ? formatDate(bankAccount.lastReconciledDate)
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
