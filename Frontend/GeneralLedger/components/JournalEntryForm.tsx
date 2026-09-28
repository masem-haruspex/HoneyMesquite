// components/JournalEntryForm.tsx
import { useState } from 'react';
import type { 
  Account, 
  BankAccount, 
  JournalEntry, 
  JournalEntryRequest 
} from '../generalLedger';
import './JournalEntryForm.scss';

interface JournalEntryFormProps {
  accounts: Account[];
  bankAccounts: BankAccount[];
  journalEntries: JournalEntry[];
  onCreateEntry: (entry: JournalEntryRequest) => Promise<JournalEntry>;
  onPostEntry: (id: number) => Promise<void>;
}

export default function JournalEntryForm({ 
  accounts, 
  bankAccounts, 
  journalEntries,
  onCreateEntry, 
  onPostEntry 
}: JournalEntryFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  const [newEntry, setNewEntry] = useState<JournalEntryRequest>({
    date: new Date().toISOString().split('T')[0],
    accountCode: '',
    description: '',
    debitAmount: 0,
    creditAmount: 0
  });

  const [isDebit, setIsDebit] = useState(true);

  const handleCreateEntry = async () => {
    if (!newEntry.accountCode || !newEntry.description) {
      alert('Please fill in all required fields');
      return;
    }

    if ((!newEntry.debitAmount || newEntry.debitAmount <= 0) && 
        (!newEntry.creditAmount || newEntry.creditAmount <= 0)) {
      alert('Please enter either a debit or credit amount');
      return;
    }

    try {
      await onCreateEntry(newEntry);
      setShowForm(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        accountCode: '',
        description: '',
        debitAmount: 0,
        creditAmount: 0
      });
    } catch (error) {
      console.error('Error creating journal entry:', error);
    }
  };

  const handlePostSelected = async () => {
    for (const id of selectedEntries) {
      try {
        await onPostEntry(id);
      } catch (error) {
        console.error(`Error posting entry ${id}:`, error);
      }
    }
    setSelectedEntries(new Set());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAccountName = (code: string) => {
    const account = accounts.find(a => a.code === code);
    return account ? account.name : 'Unknown';
  };

  return (
    <div className="journal-entries-container">
      <div className="entries-header">
        <h3>Journal Entries</h3>
        <div className="header-actions">
          <button 
            className="post-btn"
            onClick={handlePostSelected}
            disabled={selectedEntries.size === 0}
          >
            Post Selected ({selectedEntries.size})
          </button>
          <button 
            className="new-entry-btn"
            onClick={() => setShowForm(true)}
          >
            + New Journal Entry
          </button>
        </div>
      </div>

      {showForm && (
        <div className="entry-form-overlay">
          <div className="entry-form">
            <h4>Create Journal Entry</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Account</label>
                <select
                  value={newEntry.accountCode}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, accountCode: e.target.value }))}
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account.code} value={account.code}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={newEntry.description}
                onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            </div>
            <div className="form-row">
              <div className="form-group amount-group">
                <label>Transaction Type</label>
                <div className="amount-toggle">
                  <button
                    className={`toggle-btn ${isDebit ? 'active' : ''}`}
                    onClick={() => setIsDebit(true)}
                  >
                    Debit
                  </button>
                  <button
                    className={`toggle-btn ${!isDebit ? 'active' : ''}`}
                    onClick={() => setIsDebit(false)}
                  >
                    Credit
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>{isDebit ? 'Debit Amount' : 'Credit Amount'}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={isDebit ? newEntry.debitAmount : newEntry.creditAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setNewEntry(prev => ({
                      ...prev,
                      debitAmount: isDebit ? value : 0,
                      creditAmount: !isDebit ? value : 0
                    }));
                  }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Reference Number (optional)</label>
                <input
                  type="text"
                  value={newEntry.referenceNumber || ''}
                  onChange={(e) => setNewEntry(prev => ({ 
                    ...prev, 
                    referenceNumber: e.target.value 
                  }))}
                  placeholder="e.g., INV-001"
                />
              </div>
              <div className="form-group">
                <label>Bank Account (optional)</label>
                <select
                  value={newEntry.bankAccountId || ''}
                  onChange={(e) => setNewEntry(prev => ({ 
                    ...prev, 
                    bankAccountId: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleCreateEntry}>
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="entries-list">
        <div className="table-header">
          <div className="header-cell select-cell">
            <input 
              type="checkbox" 
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEntries(new Set(journalEntries
                    .filter(e => e.status === 'DRAFT')
                    .map(e => e.id)));
                } else {
                  setSelectedEntries(new Set());
                }
              }}
            />
          </div>
          <div className="header-cell">Entry #</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Account</div>
          <div className="header-cell">Description</div>
          <div className="header-cell">Debit</div>
          <div className="header-cell">Credit</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {journalEntries.map(entry => (
            <div 
              key={entry.id}
              className={`table-row ${entry.status.toLowerCase()}`}
            >
              <div className="table-cell select-cell">
                <input 
                  type="checkbox"
                  checked={selectedEntries.has(entry.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedEntries);
                    if (e.target.checked) {
                      newSelected.add(entry.id);
                    } else {
                      newSelected.delete(entry.id);
                    }
                    setSelectedEntries(newSelected);
                  }}
                  disabled={entry.status !== 'DRAFT'}
                />
              </div>
              <div className="table-cell entry-number">
                {entry.journalEntryNumber}
              </div>
              <div className="table-cell">
                {formatDate(entry.date)}
              </div>
              <div className="table-cell">
                <div className="account-info">
                  <span className="account-code">{entry.accountCode}</span>
                  <span className="account-name">{getAccountName(entry.accountCode)}</span>
                </div>
              </div>
              <div className="table-cell description">
                {entry.description}
              </div>
              <div className="table-cell debit">
                {entry.debitAmount > 0 ? `$${entry.debitAmount.toLocaleString()}` : '-'}
              </div>
              <div className="table-cell credit">
                {entry.creditAmount > 0 ? `$${entry.creditAmount.toLocaleString()}` : '-'}
              </div>
              <div className="table-cell status">
                <span className={`status-badge ${entry.status.toLowerCase()}`}>
                  {entry.status}
                </span>
              </div>
              <div className="table-cell actions">
                {entry.status === 'DRAFT' && (
                  <button 
                    className="action-btn post-btn"
                    onClick={() => onPostEntry(entry.id)}
                  >
                    Post
                  </button>
                )}
                {entry.status === 'POSTED' && !entry.reconciled && (
                  <span className="reconciled-status">Unreconciled</span>
                )}
                {entry.reconciled && (
                  <span className="reconciled-status reconciled">✓ Reconciled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="entries-summary">
        <div className="summary-item">
          <span className="summary-label">Total Debits:</span>
          <span className="summary-value">
            ${journalEntries.reduce((sum, entry) => sum + entry.debitAmount, 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Credits:</span>
          <span className="summary-value">
            ${journalEntries.reduce((sum, entry) => sum + entry.creditAmount, 0).toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Balance:</span>
          <span className={`summary-value ${
            Math.abs(journalEntries.reduce((sum, entry) => sum + entry.debitAmount - entry.creditAmount, 0)) > 0.01 
              ? 'unbalanced' 
              : 'balanced'
          }`}>
            {Math.abs(journalEntries.reduce((sum, entry) => sum + entry.debitAmount - entry.creditAmount, 0)).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
