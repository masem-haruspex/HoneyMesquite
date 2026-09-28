// CashFlow/components/BankReconciliation.tsx
import { useState, useMemo, useEffect } from 'react';
import { COLORS } from '../../colors';
import './BankReconciliation.scss';
import type {
  BankAccount,
  BankStatement,
  JournalEntry,
  StatementLine
} from '../../GeneralLedger/generalLedger';

interface BankReconciliationProps {
  bankAccounts: BankAccount[];
  statements: BankStatement[];
  journalEntries: JournalEntry[];
  loading: boolean;
  onUploadStatement: (data: {
    bankAccountId: number;
    statementDate: string;
    file: File;
  }) => Promise<BankStatement>;
  onMatchEntry: (lineId: number, journalEntryId: number) => Promise<void>;
  onCompleteReconciliation: (sessionId: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

interface ReconciliationSummary {
  statementBalance: number;
  bookBalance: number;
  adjustedBookBalance: number;
  outstandingDeposits: number;
  outstandingChecks: number;
  difference: number;
  isBalanced: boolean;
}

interface UploadFormData {
  statementDate: string;
  file: File | null;
}

export default function BankReconciliation({
  bankAccounts,
  statements,
  journalEntries,
  loading,
  onUploadStatement,
  onMatchEntry,
  onCompleteReconciliation,
  onRefresh
}: BankReconciliationProps) {
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    statementDate: new Date().toISOString().split('T')[0],
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [reconciliationMode, setReconciliationMode] = useState<'idle' | 'matching' | 'review'>('idle');
  const [matchedItems, setMatchedItems] = useState<Map<number, number>>(new Map());
  const [selectedStatementLines, setSelectedStatementLines] = useState<StatementLine[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedBankAccount) {
      setSelectedBankAccount(bankAccounts[0]);
    }
  }, [bankAccounts, selectedBankAccount]);

  const filteredStatements = useMemo(() => {
    if (!selectedBankAccount) return statements;
    return statements.filter(s => s.bankAccountId === selectedBankAccount.id);
  }, [statements, selectedBankAccount]);

  const unreconciledEntries = useMemo(() => {
    if (!selectedBankAccount) return [];
    return journalEntries.filter(je =>
      je.bankAccountId === selectedBankAccount.id &&
      !je.reconciled &&
      je.status === 'POSTED'
    );
  }, [journalEntries, selectedBankAccount]);

  const reconciliationSummary = useMemo<ReconciliationSummary | null>(() => {
    if (!selectedStatement || !selectedBankAccount) return null;

    const statementBalance = selectedStatement.closingBalance;
    const bookBalance = selectedBankAccount.currentBalance;

    const outstandingDeposits = unreconciledEntries
      .filter(e => e.debitAmount > 0) 
      .reduce((sum, e) => sum + e.debitAmount, 0);

    const outstandingChecks = unreconciledEntries
      .filter(e => e.creditAmount > 0) 
      .reduce((sum, e) => sum + e.creditAmount, 0);

    const adjustedBookBalance = bookBalance + outstandingDeposits - outstandingChecks;
    const difference = statementBalance - adjustedBookBalance;

    return {
      statementBalance,
      bookBalance,
      adjustedBookBalance,
      outstandingDeposits,
      outstandingChecks,
      difference,
      isBalanced: Math.abs(difference) < 0.01
    };
  }, [selectedStatement, selectedBankAccount, unreconciledEntries]);

  const mockStatementLines = useMemo(() => {
    if (!selectedStatement) return [];

    return unreconciledEntries.map((entry, index) => ({
      id: index + 1,
      statementId: selectedStatement.id,
      transactionDate: entry.date,
      description: entry.description,
      amount: entry.debitAmount > 0 ? entry.debitAmount : entry.creditAmount,
      balance: 0,
      reference: entry.referenceNumber || '',
      transactionType: entry.debitAmount > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
      isReconciled: false,
      journalEntryId: undefined,
      matchConfidence: 0.8,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as StatementLine));
  }, [selectedStatement, unreconciledEntries]);

  const handleUpload = async () => {
    if (!uploadForm.file || !selectedBankAccount) {
      alert('Please select a bank account and a file to upload');
      return;
    }

    setUploading(true);
    try {
      await onUploadStatement({
        bankAccountId: selectedBankAccount.id,
        statementDate: uploadForm.statementDate,
        file: uploadForm.file
      });

      setShowUploadModal(false);
      setUploadForm({
        statementDate: new Date().toISOString().split('T')[0],
        file: null
      });

      await onRefresh();
    } catch (error) {
      console.error('Failed to upload statement:', error);
      alert('Failed to upload statement. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartReconciliation = () => {
    if (selectedStatement) {
      setReconciliationMode('matching');
      setSelectedStatementLines(mockStatementLines);
      setShowInstructions(false);
    }
  };

  const handleMatch = async (lineId: number, journalEntryId: number) => {
    try {
      await onMatchEntry(lineId, journalEntryId);
      setMatchedItems(prev => new Map(prev).set(lineId, journalEntryId));

      setSelectedStatementLines(prev => prev.map(line =>
        line.id === lineId ? { ...line, isReconciled: true, journalEntryId } : line
      ));
    } catch (error) {
      console.error(`Failed to match line ${lineId}:`, error);
    }
  };

  const handleUnmatch = (lineId: number) => {
    setMatchedItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(lineId);
      return newMap;
    });

    setSelectedStatementLines(prev => prev.map(line =>
      line.id === lineId ? { ...line, isReconciled: false, journalEntryId: undefined } : line
    ));
  };

  const handleCompleteReconciliation = async () => {
    if (!selectedStatement) return;

    try {
      await onCompleteReconciliation(selectedStatement.id);

      setReconciliationMode('idle');
      setMatchedItems(new Map());
      setSelectedStatementLines([]);
      setSelectedStatement(null);

      await onRefresh();

      alert('Reconciliation completed successfully!');
    } catch (error) {
      console.error('Failed to complete reconciliation:', error);
      alert('Failed to complete reconciliation. Please try again.');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return COLORS.WARNING;
      case 'PROCESSING': return COLORS.PRIMARY;
      case 'RECONCILED': return COLORS.INCOME;
      case 'ERROR': return COLORS.ERROR;
      default: return COLORS.MUTED;
    }
  };

  if (loading) {
    return (
      <div className="bank-reconciliation-loading">
        <div className="spinner" />
        <p>Loading bank reconciliation data...</p>
      </div>
    );
  }

  return (
    <div className="bank-reconciliation-container">
      <div className="reconciliation-header">
        <h3>Bank Reconciliation</h3>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={onRefresh}
            disabled={uploading}
          >
            ↻ Refresh
          </button>
          <button
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedBankAccount || uploading}
          >
            Upload Statement
          </button>
        </div>
      </div>

      <div className="account-selection">
        <h4>Select Bank Account</h4>
        <div className="account-cards">
          {bankAccounts.map(account => (
            <div
              key={account.id}
              className={`account-card ${selectedBankAccount?.id === account.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedBankAccount(account);
                setSelectedStatement(null);
                setReconciliationMode('idle');
                setShowInstructions(true);
              }}
            >
              <div className="account-name">{account.name}</div>
              <div className="account-details">
                <span className="account-number">•••• {account.accountNumber?.slice(-4) || 'XXXX'}</span>
                <span className="account-type">{account.accountType}</span>
              </div>
              <div className="account-balance">
                {formatCurrency(account.currentBalance)}
              </div>
              <div className="last-reconciled">
                Last reconciled: {account.lastReconciledDate
                  ? formatDate(account.lastReconciledDate)
                  : 'Never'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBankAccount && (
        <>
          <div className="statements-section">
            <div className="section-header">
              <h4>Bank Statements</h4>
              <span className="unreconciled-count">
                {unreconciledEntries.length} unreconciled entries
              </span>
            </div>

            {filteredStatements.length === 0 ? (
              <div className="empty-statements">
                <p>No bank statements found for this account.</p>
                <p>Upload a statement to begin reconciliation.</p>
              </div>
            ) : (
              <div className="statements-grid">
                {filteredStatements.map(statement => (
                  <div
                    key={statement.id}
                    className={`statement-card ${selectedStatement?.id === statement.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedStatement(statement);
                      setReconciliationMode('idle');
                    }}
                  >
                    <div className="statement-header">
                      <span className="statement-date">
                        {formatDate(statement.statementDate)}
                      </span>
                      <span
                        className="statement-status"
                        style={{
                          backgroundColor: getStatusColor(statement.status),
                          color: 'white'
                        }}
                      >
                        {statement.status}
                      </span>
                    </div>
                    <div className="statement-details">
                      <div className="detail-row">
                        <span>Opening:</span>
                        <span>{formatCurrency(statement.openingBalance)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Closing:</span>
                        <span>{formatCurrency(statement.closingBalance)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Period:</span>
                        <span>
                          {formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStatement(statement);
                          handleStartReconciliation();
                        }}
                      >
                        Reconcile
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {reconciliationMode === 'matching' && selectedStatement && reconciliationSummary && (
            <div className="reconciliation-view">
              <div className="view-header">
                <h4>Reconciling: {selectedBankAccount.name}</h4>
                <button
                  className="close-btn"
                  onClick={() => {
                    setReconciliationMode('idle');
                    setMatchedItems(new Map());
                    setSelectedStatementLines([]);
                  }}
                >
                  Cancel
                </button>
              </div>

              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-label">Statement Balance</div>
                  <div className="card-value">
                    {formatCurrency(reconciliationSummary.statementBalance)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-label">Book Balance</div>
                  <div className="card-value">
                    {formatCurrency(reconciliationSummary.bookBalance)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-label">Outstanding Deposits</div>
                  <div className="card-value positive">
                    {formatCurrency(reconciliationSummary.outstandingDeposits)}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-label">Outstanding Checks</div>
                  <div className="card-value negative">
                    {formatCurrency(reconciliationSummary.outstandingChecks)}
                  </div>
                </div>
                <div className={`summary-card difference ${reconciliationSummary.isBalanced ? 'balanced' : 'unbalanced'}`}>
                  <div className="card-label">Difference</div>
                  <div className="card-value">
                    {formatCurrency(reconciliationSummary.difference)}
                  </div>
                </div>
              </div>

              <div className="matching-interface">
                <div className="unreconciled-items">
                  <h5>Unreconciled Journal Entries</h5>
                  <div className="items-list">
                    {unreconciledEntries.map(entry => {
                      const isMatched = Array.from(matchedItems.values()).includes(entry.id);

                      return (
                        <div key={entry.id} className={`unreconciled-item ${isMatched ? 'matched' : ''}`}>
                          <div className="item-header">
                            <span className="entry-date">
                              {formatDate(entry.date)}
                            </span>
                            <span className="entry-number">{entry.journalEntryNumber}</span>
                          </div>
                          <div className="item-details">
                            <span className="item-description" title={entry.description}>
                              {entry.description.length > 30
                                ? entry.description.substring(0, 30) + '...'
                                : entry.description}
                            </span>
                            <span className={`item-amount ${entry.debitAmount > 0 ? 'debit' : 'credit'}`}>
                              {entry.debitAmount > 0
                                ? `DR ${formatCurrency(entry.debitAmount)}`
                                : `CR ${formatCurrency(entry.creditAmount)}`}
                            </span>
                          </div>
                          <div className="item-actions">
                            {isMatched ? (
                              <span className="matched-badge">✓ Matched</span>
                            ) : (
                              <select
                                className="match-select"
                                defaultValue=""
                                onChange={(e) => {
                                  const lineId = parseInt(e.target.value);
                                  if (lineId && !isNaN(lineId)) {
                                    handleMatch(lineId, entry.id);
                                  }
                                }}
                              >
                                <option value="">Match to...</option>
                                {selectedStatementLines
                                  .filter(line => !line.isReconciled)
                                  .map(line => (
                                    <option key={line.id} value={line.id}>
                                      {formatDate(line.transactionDate)} - {formatCurrency(line.amount)}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="statement-lines">
                  <h5>Statement Lines</h5>
                  <div className="lines-list">
                    {selectedStatementLines.length === 0 ? (
                      <div className="empty-state">
                        Upload a bank statement to see transaction lines
                      </div>
                    ) : (
                      selectedStatementLines.map(line => {
                        const matchedEntryId = matchedItems.get(line.id);
                        const matchedEntry = matchedEntryId
                          ? unreconciledEntries.find(e => e.id === matchedEntryId)
                          : null;

                        return (
                          <div key={line.id} className={`statement-line ${line.isReconciled ? 'reconciled' : ''}`}>
                            <div className="line-header">
                              <span className="line-date">{formatDate(line.transactionDate)}</span>
                              <span className="line-type">{line.transactionType}</span>
                            </div>
                            <div className="line-details">
                              <span className="line-description">{line.description}</span>
                              <span className="line-amount">{formatCurrency(line.amount)}</span>
                            </div>
                            <div className="line-actions">
                              {line.isReconciled && matchedEntry ? (
                                <div className="matched-info">
                                  <span>Matched: {matchedEntry.journalEntryNumber}</span>
                                  <button
                                    className="unmatch-btn"
                                    onClick={() => handleUnmatch(line.id)}
                                  >
                                    Unmatch
                                  </button>
                                </div>
                              ) : (
                                <span className="unmatched">Unmatched</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="reconciliation-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setReconciliationMode('idle');
                    setMatchedItems(new Map());
                    setSelectedStatementLines([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`complete-btn ${reconciliationSummary.isBalanced ? '' : 'disabled'}`}
                  onClick={handleCompleteReconciliation}
                  disabled={!reconciliationSummary.isBalanced || matchedItems.size === 0}
                >
                  {reconciliationSummary.isBalanced
                    ? `Complete Reconciliation (${matchedItems.size} matched)`
                    : 'Not Balanced'}
                </button>
              </div>
            </div>
          )}

          {showInstructions && reconciliationMode === 'idle' && (
            <div className="instructions">
              <h4>How to Reconcile Bank Accounts</h4>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <strong>Select a bank account</strong>
                    <p>Choose the bank account you want to reconcile from the list above.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <strong>Upload bank statement</strong>
                    <p>Download your bank statement and upload it in CSV, OFX, or PDF format.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <strong>Match transactions</strong>
                    <p>Match journal entries from your books with transactions from the bank statement.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <strong>Complete reconciliation</strong>
                    <p>Review differences and complete the reconciliation when balances match.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showUploadModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <h4>Upload Bank Statement</h4>
              <button
                className="close-modal"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({
                    statementDate: new Date().toISOString().split('T')[0],
                    file: null
                  });
                }}
                disabled={uploading}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Bank Account</label>
                <div className="selected-account">
                  {selectedBankAccount?.name || 'Please select a bank account first'}
                </div>
              </div>
              <div className="form-group">
                <label>Statement Date</label>
                <input
                  type="date"
                  value={uploadForm.statementDate}
                  onChange={(e) => setUploadForm(prev => ({
                    ...prev,
                    statementDate: e.target.value
                  }))}
                  disabled={uploading}
                />
              </div>
              <div className="form-group">
                <label>Statement File</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".csv,.ofx,.qfx,.txt,.pdf"
                    onChange={(e) => setUploadForm(prev => ({
                      ...prev,
                      file: e.target.files?.[0] || null
                    }))}
                    disabled={uploading}
                  />
                  {uploadForm.file && (
                    <div className="file-info">
                      {uploadForm.file.name} ({(uploadForm.file.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>
                <div className="file-help">
                  Supported formats: CSV, OFX, QFX, TXT, PDF
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({
                    statementDate: new Date().toISOString().split('T')[0],
                    file: null
                  });
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={!uploadForm.file || !selectedBankAccount || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload & Process'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bankAccounts.length === 0 && (
        <div className="no-accounts-message">
          <div className="message-icon">🏦</div>
          <h4>No Bank Accounts Found</h4>
          <p>Set up bank accounts in the General Ledger to begin reconciliation.</p>
          <button className="setup-btn" onClick={onRefresh}>
            Check for Bank Accounts
          </button>
        </div>
      )}
    </div>
  );
}
