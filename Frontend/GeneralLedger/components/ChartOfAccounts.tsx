// components/ChartOfAccounts.tsx
import { useState } from 'react';
import { COLORS } from '../../colors';
import type { Account, AccountRequest } from '../generalLedger';
import './ChartOfAccounts.scss';

interface ChartOfAccountsProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  onCreateAccount: (account: AccountRequest) => Promise<Account>;
}

export default function ChartOfAccounts({ 
  accounts, 
  onSelectAccount, 
  onCreateAccount 
}: ChartOfAccountsProps) {
  const [showForm, setShowForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([]));
  const [newAccount, setNewAccount] = useState<AccountRequest>({
    code: '',
    name: '',
    type: 'ASSET',
    normalBalance: 'DEBIT'
  });

  const groupedAccounts = accounts.reduce((acc, account) => {
    const mainCategory = account.code.substring(0, 1) + '000';
    if (!acc[mainCategory]) {
      acc[mainCategory] = [];
    }
    acc[mainCategory].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  const toggleCategory = (categoryCode: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryCode)) {
        newSet.delete(categoryCode);
      } else {
        newSet.add(categoryCode);
      }
      return newSet;
    });
  };

  const handleCreateAccount = async () => {
    if (!newAccount.code || !newAccount.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await onCreateAccount(newAccount);
      setShowForm(false);
      setNewAccount({
        code: '',
        name: '',
        type: 'ASSET',
        normalBalance: 'DEBIT'
      });
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'ASSET': return COLORS.INCOME;
      case 'LIABILITY': return COLORS.EXPENSE;
      case 'EQUITY': return COLORS.PRIMARY;
      case 'REVENUE': return COLORS.WARNING;
      case 'EXPENSE': return COLORS.CRITICAL;
      default: return COLORS.MUTED;
    }
  };

  return (
    <div className="chart-of-accounts-container">
      <div className="chart-header">
        <h3>Chart of Accounts</h3>
        <button 
          className="add-account-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Account
        </button>
      </div>

      {showForm && (
        <div className="account-form-overlay">
          <div className="account-form">
            <h4>New Account</h4>
            <div className="form-group">
              <label>Account Code</label>
              <input
                type="text"
                value={newAccount.code}
                onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., 1110"
              />
            </div>
            <div className="form-group">
              <label>Account Name</label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Checking Account"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount(prev => ({ 
                    ...prev, 
                    type: e.target.value as any 
                  }))}
                >
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                  <option value="REVENUE">Revenue</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Normal Balance</label>
                <select
                  value={newAccount.normalBalance}
                  onChange={(e) => setNewAccount(prev => ({ 
                    ...prev, 
                    normalBalance: e.target.value as any 
                  }))}
                >
                  <option value="DEBIT">Debit</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Parent Account Code (optional)</label>
              <input
                type="text"
                value={newAccount.parentCode || ''}
                onChange={(e) => setNewAccount(prev => ({ 
                  ...prev, 
                  parentCode: e.target.value || undefined 
                }))}
                placeholder="e.g., 1000"
              />
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleCreateAccount}>
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="accounts-tree">
        {Object.entries(groupedAccounts).map(([categoryCode, categoryAccounts]) => {
          const categoryName = categoryAccounts[0]?.type || 'Unknown';
          const isExpanded = expandedCategories.has(categoryCode);

          return (
            <div key={categoryCode} className="category-group">
              <div 
                className="category-header"
                onClick={() => toggleCategory(categoryCode)}
                style={{ borderLeftColor: getCategoryColor(categoryName) }}
              >
                <div className="category-info">
                  <span className="category-code">{categoryCode}</span>
                  <span className="category-name">{categoryName}</span>
                  <span className="account-count">{categoryAccounts.length} accounts</span>
                </div>
                <div className="expand-icon">
                  {isExpanded ? '▼' : '►'}
                </div>
              </div>

              {isExpanded && (
                <div className="accounts-list">
                  {categoryAccounts.map(account => (
                    <div 
                      key={account.code}
                      className="account-item"
                      onClick={() => onSelectAccount(account)}
                    >
                      <div className="account-code-name">
                        <span className="account-code">{account.code}</span>
                        <span className="account-name">{account.name}</span>
                      </div>
                      <div className="account-details">
                        <span className={`normal-balance ${account.normalBalance.toLowerCase()}`}>
                          {account.normalBalance}
                        </span>
                        <span className={`status ${account.isActive ? 'active' : 'inactive'}`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
