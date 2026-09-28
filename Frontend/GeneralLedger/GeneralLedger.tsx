// GeneralLedger.tsx
import { Html, Text } from '@react-three/drei';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import React, { useEffect, Suspense } from 'react';
import "./GeneralLedger.scss";
import { COLORS } from '../colors';
import { loadingAtom } from '../atoms/dataAtoms';
import type {
    Account,
    JournalEntry,
    BankAccount,
    BankStatement,
    TrialBalanceItem,
    AccountingPeriod
} from './generalLedger';
import { GeneralLedgerService } from './GeneralLedgerService';

const accountsAtom = atomWithStorage<Account[]>('general-ledger/accounts', []);
const journalEntriesAtom = atomWithStorage<JournalEntry[]>('general-ledger/journal-entries', []);
const bankAccountsAtom = atomWithStorage<BankAccount[]>('general-ledger/bank-accounts', []);
const bankStatementsAtom = atomWithStorage<BankStatement[]>('general-ledger/bank-statements', []);
const trialBalanceAtom = atomWithStorage<TrialBalanceItem[]>('general-ledger/trial-balance', []);
const accountingPeriodsAtom = atomWithStorage<AccountingPeriod[]>('general-ledger/accounting-periods', []);
const loadingGLAtom = atomWithStorage<boolean>('general-ledger/loading', false);
const errorAtom = atomWithStorage<string | null>('general-ledger/error', null);
const activeViewAtom = atomWithStorage<'chart-of-accounts' | 'journal-entries' | 'trial-balance' | 'account-ledger' | 'bank-reconciliation' | 'period-close'>('general-ledger/view', 'journal-entries');
const selectedAccountAtom = atomWithStorage<Account | null>('general-ledger/selected-account', null);
const selectedBankAccountAtom = atomWithStorage<BankAccount | null>('general-ledger/selected-bank-account', null);

const ChartOfAccounts = React.lazy(() => import('./components/ChartOfAccounts'));
const JournalEntryForm = React.lazy(() => import('./components/JournalEntryForm'));
const TrialBalanceView = React.lazy(() => import('./components/TrialBalanceView'));
const AccountLedgerView = React.lazy(() => import('./components/AccountLedgerView'));
const BankReconciliation = React.lazy(() => import('./components/BankReconciliation'));
const PeriodCloseView = React.lazy(() => import('./components/PeriodCloseView'));

export default function GeneralLedger({ position }: { position: [number, number, number] }) {
  position[1] -= 0.25;

  const [appLoading] = useAtom(loadingAtom);

  const [accounts, setAccounts] = useAtom(accountsAtom);
  const [journalEntries, setJournalEntries] = useAtom(journalEntriesAtom);
  const [bankAccounts, setBankAccounts] = useAtom(bankAccountsAtom);
  const [bankStatements, setBankStatements] = useAtom(bankStatementsAtom);
  const [trialBalance, setTrialBalance] = useAtom(trialBalanceAtom);
  const [accountingPeriods, setAccountingPeriods] = useAtom(accountingPeriodsAtom);
  const [loading, setLoading] = useAtom(loadingGLAtom);
  const [error, setError] = useAtom(errorAtom);
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
  const [selectedBankAccount, setSelectedBankAccount] = useAtom(selectedBankAccountAtom);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          accountsData,
          journalEntriesData,
          bankAccountsData,
          trialBalanceData,
          periodsData
        ] = await Promise.all([
          GeneralLedgerService.getAllAccounts(),
          GeneralLedgerService.getJournalEntries({ 
            startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          }),
          GeneralLedgerService.getBankAccounts(),
          GeneralLedgerService.getTrialBalance(),
          GeneralLedgerService.getAccountingPeriods()
        ]);

        setAccounts(accountsData);
        setJournalEntries(journalEntriesData);
        setBankAccounts(bankAccountsData);
        setTrialBalance(trialBalanceData);
        setAccountingPeriods(periodsData);

      } catch (err) {
        console.error('Failed to load general ledger data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [setAccounts, setJournalEntries, setBankAccounts, setTrialBalance, 
      setAccountingPeriods, setLoading, setError]);

useEffect(() => {
  if (bankAccounts.length > 0 && !selectedBankAccount) {
    setSelectedBankAccount(bankAccounts[0]);
    handleLoadBankStatements(bankAccounts[0].id);
  }
}, [bankAccounts, selectedBankAccount, setSelectedBankAccount]);

  const handleCreateJournalEntry = async (entry: any) => {
    try {
      const newEntry = await GeneralLedgerService.createJournalEntry(entry);
      setJournalEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      console.error('Error creating journal entry:', err);
      throw err;
    }
  };

  const handlePostJournalEntry = async (id: number) => {
    try {
      const updatedEntry = await GeneralLedgerService.postJournalEntry(id);
      setJournalEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ));
    } catch (err) {
      console.error('Error posting journal entry:', err);
      throw err;
    }
  };

  const handleCreateAccount = async (account: any) => {
    try {
      const newAccount = await GeneralLedgerService.createAccount(account);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (err) {
      console.error('Error creating account:', err);
      throw err;
    }
  };

  const handleLoadBankStatements = async (bankAccountId: number) => {
    try {
      const statements = await GeneralLedgerService.getBankStatements(bankAccountId);
      setBankStatements(statements);
    } catch (err) {
      console.error('Error loading bank statements:', err);
      throw err;
    }
  };

  if (appLoading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          Loading application data…
        </Text>
      </group>
    );
  }

  if (loading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          Loading general ledger…
        </Text>
      </group>
    );
  }

  return (
    <Html
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
      position={[0, 0, 0]}
      className="general-ledger-wrapper"
      transform
    >
      <div className="general-ledger-dashboard">
        <div className="glow-effect" />

        <div className="dashboard-header">

          <div className="tabs">
            {(['chart-of-accounts', 'journal-entries', 'trial-balance', 'account-ledger', 'bank-reconciliation', 'period-close'] as const).map((view) => (
              <button
                key={view}
                className={`tab-button ${activeView === view ? 'active' : ''}`}
                onClick={() => setActiveView(view)}
              >
                {view === 'chart-of-accounts' ? 'Chart of Accounts' :
                 view === 'journal-entries' ? 'Journal Entries' :
                 view === 'trial-balance' ? 'Trial Balance' :
                 view === 'account-ledger' ? 'Account Ledger' :
                 view === 'bank-reconciliation' ? 'Bank Reconciliation' :
                 'Period Close'}
              </button>
            ))}
          </div>

        </div>

        <div className="main-content">
          {error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="right-panel">
                <Suspense fallback={<div className="loading-indicator"><div className="spinner" />Loading...</div>}>
                  {activeView === 'chart-of-accounts' && (
                    <ChartOfAccounts
                      accounts={accounts}
                      onSelectAccount={setSelectedAccount}
                      onCreateAccount={handleCreateAccount}
                    />
                  )}

                  {activeView === 'journal-entries' && (
                    <JournalEntryForm
                      accounts={accounts}
                      onCreateEntry={handleCreateJournalEntry}
                      onPostEntry={handlePostJournalEntry}
                      journalEntries={journalEntries}
                      bankAccounts={bankAccounts}
                    />
                  )}

                  {activeView === 'trial-balance' && (
                    <TrialBalanceView
                      trialBalance={trialBalance}
                      onAccountSelect={(accountCode) => {
                        const account = accounts.find(a => a.code === accountCode);
                        if (account) {
                          setSelectedAccount(account);
                          setActiveView('account-ledger');
                        }
                      }}
                    />
                  )}

                  {activeView === 'account-ledger' && selectedAccount && (
                    <AccountLedgerView
                      account={selectedAccount}
                      journalEntries={journalEntries.filter(je => je.accountCode === selectedAccount.code)}
                      onBack={() => setActiveView('chart-of-accounts')}
                    />
                  )}

                  {activeView === 'bank-reconciliation' && selectedBankAccount && (
                    <BankReconciliation
                      bankAccount={selectedBankAccount}
                      bankStatements={bankStatements}
                      journalEntries={journalEntries.filter(je => je.bankAccountId === selectedBankAccount.id)}
                      onRefresh={() => handleLoadBankStatements(selectedBankAccount.id)}
                    />
                  )}

                  {activeView === 'period-close' && (
                    <PeriodCloseView
                      accountingPeriods={accountingPeriods}
                      onClosePeriod={async (periodId) => {
                        try {
                          const updatedPeriod = await GeneralLedgerService.closePeriod(periodId);
                          setAccountingPeriods(prev => prev.map(p => 
                            p.id === periodId ? updatedPeriod : p
                          ));
                        } catch (err) {
                          console.error('Error closing period:', err);
                        }
                      }}
                    />
                  )}
                </Suspense>
              </div>
            </>
          )}
        </div>
      </div>
    </Html>
  );
}
