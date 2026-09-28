import api from '../api';
import { MockDataService } from '../MockDataService';
import type {
	Account,
		JournalEntry,
		BankAccount,
		BankStatement,
		StatementLine,
		ReconciliationSession,
		AccountingPeriod,
		TrialBalanceItem,
		JournalEntryRequest,
		AccountRequest,
		BankAccountRequest,
		BankStatementUploadRequest
} from './generalLedger';

const USE_MOCK_DATA = true;

const DEBUG_PREFIX = '[GeneralLedgerService]';
const debugLog = (message: string, data?: any) => {
	const DEBUG_MODE = false;
	if (DEBUG_MODE) {
		const timestamp = new Date().toISOString();
		console.log(`${DEBUG_PREFIX} [${timestamp}] ${message}`, data);
	}
};

export const GeneralLedgerService = {
	async getAllAccounts(): Promise<Account[]> {
		debugLog('getAllAccounts: Starting request');

		if (USE_MOCK_DATA) {
			const data = await MockDataService.getGLAccounts();
			debugLog('getAllAccounts: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<Account[]>('/general-ledger/accounts');
			debugLog('getAllAccounts: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getAllAccounts: Error', error);
			throw error;
		}
	},

	async createAccount(account: AccountRequest): Promise<Account> {
		debugLog('createAccount: Starting request', account);

		if (USE_MOCK_DATA) {
			const newAccount: Account = {
				id: Math.floor(Math.random() * 10000),
				...account,
				parentCode: account.parentCode || null,
				isActive: true,
				createdAt: new Date().toISOString(),
			};
			debugLog('createAccount: Mock Success', { code: newAccount.code });
			return newAccount;
		}

		try {
			const response = await api.post<Account>('/general-ledger/accounts', account);
			debugLog('createAccount: API Success', { code: response.data.code });
			return response.data;
		} catch (error) {
			debugLog('createAccount: Error', error);
			throw error;
		}
	},

	async updateAccount(code: string, account: Partial<AccountRequest>): Promise<Account> {
		debugLog('updateAccount: Starting request', { code, account });

		if (USE_MOCK_DATA) {
			const allData = await MockDataService.getGLAccounts();
			const found = allData.find(item => item.code === code);
			if (!found) throw new Error('Account not found');
			const updated = { ...found, ...account } as Account;
			debugLog('updateAccount: Mock Success', { code });
			return updated;
		}

		try {
			const response = await api.put<Account>(`/general-ledger/accounts/${code}`, account);
			debugLog('updateAccount: API Success', { code });
			return response.data;
		} catch (error) {
			debugLog('updateAccount: Error', error);
			throw error;
		}
	},

	async getJournalEntries(params?: {
		startDate?: string;
		endDate?: string;
		accountCode?: string;
		status?: string;
	}): Promise<JournalEntry[]> {
		debugLog('getJournalEntries: Starting request', params);

		if (USE_MOCK_DATA) {
			let data = await MockDataService.getJournalEntries();

			if (params?.status) {
				data = data.filter(entry => entry.status === params.status);
			}
			if (params?.accountCode) {
				data = data.filter(entry => entry.accountCode === params.accountCode);
			}

			debugLog('getJournalEntries: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<JournalEntry[]>('/general-ledger/journal-entries', { params });
			debugLog('getJournalEntries: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getJournalEntries: Error', error);
			throw error;
		}
	},

	async createJournalEntry(entry: JournalEntryRequest): Promise<JournalEntry> {
		debugLog('createJournalEntry: Starting request', entry);

		if (USE_MOCK_DATA) {
			const newEntry: JournalEntry = {
				id: Math.floor(Math.random() * 10000),
				journalEntryNumber: `JE-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
				...entry,
				debitAmount: entry.debitAmount || 0,
				creditAmount: entry.creditAmount || 0,
				referenceNumber: entry.referenceNumber || '',
				status: 'DRAFT',
				reconciled: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('createJournalEntry: Mock Success', { id: newEntry.id });
			return newEntry;
		}

		try {
			const response = await api.post<JournalEntry>('/general-ledger/journal-entries', entry);
			debugLog('createJournalEntry: API Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('createJournalEntry: Error', error);
			throw error;
		}
	},

	async postJournalEntry(id: number): Promise<JournalEntry> {
		debugLog('postJournalEntry: Starting request', { id });

		if (USE_MOCK_DATA) {
			const allData = await MockDataService.getJournalEntries();
			const found = allData.find(item => item.id === id);
			if (!found) throw new Error('Entry not found');
			const updated = { ...found, status: 'POSTED' as const, updatedAt: new Date().toISOString() };
			debugLog('postJournalEntry: Mock Success', { id });
			return updated;
		}

		try {
			const response = await api.post<JournalEntry>(`/general-ledger/journal-entries/${id}/post`);
			debugLog('postJournalEntry: API Success', { id });
			return response.data;
		} catch (error) {
			debugLog('postJournalEntry: Error', error);
			throw error;
		}
	},

	async voidJournalEntry(id: number): Promise<JournalEntry> {
		debugLog('voidJournalEntry: Starting request', { id });

		if (USE_MOCK_DATA) {
			const allData = await MockDataService.getJournalEntries();
			const found = allData.find(item => item.id === id);
			if (!found) throw new Error('Entry not found');
			const updated = { ...found, status: 'VOID' as const, updatedAt: new Date().toISOString() };
			debugLog('voidJournalEntry: Mock Success', { id });
			return updated;
		}

		try {
			const response = await api.post<JournalEntry>(`/general-ledger/journal-entries/${id}/void`);
			debugLog('voidJournalEntry: API Success', { id });
			return response.data;
		} catch (error) {
			debugLog('voidJournalEntry: Error', error);
			throw error;
		}
	},

	async getTrialBalance(periodId?: number): Promise<TrialBalanceItem[]> {
		debugLog('getTrialBalance: Starting request', { periodId });

		if (USE_MOCK_DATA) {
			const data = await MockDataService.getTrialBalance();
			debugLog('getTrialBalance: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<TrialBalanceItem[]>('/general-ledger/trial-balance', {
				params: { periodId }
			});
			debugLog('getTrialBalance: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getTrialBalance: Error', error);
			throw error;
		}
	},

	async getBankAccounts(): Promise<BankAccount[]> {
		debugLog('getBankAccounts: Starting request');

		if (USE_MOCK_DATA) {
			const data = await MockDataService.getBankAccounts();
			debugLog('getBankAccounts: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<BankAccount[]>('/general-ledger/bank-accounts');
			debugLog('getBankAccounts: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getBankAccounts: Error', error);
			throw error;
		}
	},

	async createBankAccount(account: BankAccountRequest): Promise<BankAccount> {
		debugLog('createBankAccount: Starting request', account);

		if (USE_MOCK_DATA) {
			const newAccount: BankAccount = {
				id: Math.floor(Math.random() * 10000),
				...account,
				currency: account.currency || 'USD',
				currentBalance: account.openingBalance,
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('createBankAccount: Mock Success', { id: newAccount.id });
			return newAccount;
		}

		try {
			const response = await api.post<BankAccount>('/general-ledger/bank-accounts', account);
			debugLog('createBankAccount: API Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('createBankAccount: Error', error);
			throw error;
		}
	},

	async getBankStatements(bankAccountId?: number): Promise<BankStatement[]> {
		debugLog('getBankStatements: Starting request', { bankAccountId });

		if (USE_MOCK_DATA) {
			let data = await MockDataService.getBankStatements();
			if (bankAccountId) {
				data = data.filter(stmt => stmt.bankAccountId === bankAccountId);
			}
			debugLog('getBankStatements: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<BankStatement[]>('/general-ledger/bank-statements', {
				params: { bankAccountId }
			});
			debugLog('getBankStatements: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getBankStatements: Error', error);
			throw error;
		}
	},

	async uploadBankStatement(data: BankStatementUploadRequest): Promise<BankStatement> {
		debugLog('uploadBankStatement: Starting request', data);

		if (USE_MOCK_DATA) {
			const newStatement: BankStatement = {
				id: Math.floor(Math.random() * 10000),
				...data,
				totalDeposits: data.closingBalance - data.openingBalance > 0 ? data.closingBalance - data.openingBalance : 0,
				totalWithdrawals: data.closingBalance - data.openingBalance < 0 ? Math.abs(data.closingBalance - data.openingBalance) : 0,
				status: 'PROCESSING',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('uploadBankStatement: Mock Success', { id: newStatement.id });
			return newStatement;
		}

		try {
			const formData = new FormData();
			Object.entries(data).forEach(([key, value]) => {
				if (value !== undefined && key !== 'file') {
					formData.append(key, value as string);
				}
			});
			if (data.file) formData.append('file', data.file);

			const response = await api.post<BankStatement>('/general-ledger/bank-statements/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			debugLog('uploadBankStatement: API Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('uploadBankStatement: Error', error);
			throw error;
		}
	},

	async getStatementLines(statementId: number): Promise<StatementLine[]> {
		debugLog('getStatementLines: Starting request', { statementId });

		if (USE_MOCK_DATA) {
			const lines: StatementLine[] = [];
			for (let i = 1; i <= 5; i++) {
				lines.push({
					id: i,
					statementId,
					transactionDate: new Date().toISOString().split('T')[0],
					description: `Mock Transaction ${i}`,
					amount: Math.random() * 1000,
					isReconciled: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				});
			}
			debugLog('getStatementLines: Mock Success', { count: lines.length });
			return lines;
		}

		try {
			const response = await api.get<StatementLine[]>(`/general-ledger/bank-statements/${statementId}/lines`);
			debugLog('getStatementLines: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getStatementLines: Error', error);
			throw error;
		}
	},

	async matchStatementLine(lineId: number, journalEntryId: number): Promise<StatementLine> {
		debugLog('matchStatementLine: Starting request', { lineId, journalEntryId });

		if (USE_MOCK_DATA) {
			const updatedLine: StatementLine = {
				id: lineId,
				statementId: 1,
				transactionDate: new Date().toISOString().split('T')[0],
				description: 'Mock Matched Line',
				amount: 100,
				isReconciled: true,
				journalEntryId,
				matchConfidence: 1.0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('matchStatementLine: Mock Success', { lineId });
			return updatedLine;
		}

		try {
			const response = await api.post<StatementLine>(`/general-ledger/statement-lines/${lineId}/match`, {
				journalEntryId
			});
			debugLog('matchStatementLine: API Success', { lineId });
			return response.data;
		} catch (error) {
			debugLog('matchStatementLine: Error', error);
			throw error;
		}
	},

	async startReconciliation(bankAccountId: number, statementId: number): Promise<ReconciliationSession> {
		debugLog('startReconciliation: Starting request', { bankAccountId, statementId });

		if (USE_MOCK_DATA) {
			const session: ReconciliationSession = {
				id: Math.floor(Math.random() * 10000),
				bankAccountId,
				statementId,
				startedBy: 'mock_user',
				openingBookBalance: 10000,
				closingBookBalance: 12000,
				statementBalance: 12000,
				reconciledBalance: 12000,
				outstandingDeposits: 0,
				outstandingWithdrawals: 0,
				status: 'IN_PROGRESS',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('startReconciliation: Mock Success', { id: session.id });
			return session;
		}

		try {
			const response = await api.post<ReconciliationSession>('/general-ledger/reconciliation/start', {
				bankAccountId,
				statementId
			});
			debugLog('startReconciliation: API Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('startReconciliation: Error', error);
			throw error;
		}
	},

	async completeReconciliation(sessionId: number): Promise<ReconciliationSession> {
		debugLog('completeReconciliation: Starting request', { sessionId });

		if (USE_MOCK_DATA) {
			const session: ReconciliationSession = {
				id: sessionId,
				bankAccountId: 1,
				statementId: 1,
				startedBy: 'mock_user',
				openingBookBalance: 10000,
				closingBookBalance: 12000,
				statementBalance: 12000,
				reconciledBalance: 12000,
				outstandingDeposits: 0,
				outstandingWithdrawals: 0,
				status: 'COMPLETED',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('completeReconciliation: Mock Success', { id: session.id });
			return session;
		}

		try {
			const response = await api.post<ReconciliationSession>(`/general-ledger/reconciliation/${sessionId}/complete`);
			debugLog('completeReconciliation: API Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('completeReconciliation: Error', error);
			throw error;
		}
	},

	async getAccountingPeriods(): Promise<AccountingPeriod[]> {
		debugLog('getAccountingPeriods: Starting request');

		if (USE_MOCK_DATA) {
			const data = await MockDataService.getAccountingPeriods();
			debugLog('getAccountingPeriods: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<AccountingPeriod[]>('/general-ledger/accounting-periods');
			debugLog('getAccountingPeriods: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getAccountingPeriods: Error', error);
			throw error;
		}
	},

	async closePeriod(periodId: number): Promise<AccountingPeriod> {
		debugLog('closePeriod: Starting request', { periodId });

		if (USE_MOCK_DATA) {
			const allData = await MockDataService.getAccountingPeriods();
			const found = allData.find(item => item.id === periodId);
			if (!found) throw new Error('Period not found');
			const updated = { ...found, status: 'CLOSED' as const, closedBy: 'mock_user' };
			debugLog('closePeriod: Mock Success', { id: updated.id });
			return updated;
		}

		try {
			const response = await api.post<AccountingPeriod>(`/general-ledger/accounting-periods/${periodId}/close`);
			debugLog('closePeriod: API Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('closePeriod: Error', error);
			throw error;
		}
	},

	async getAccountLedger(accountCode: string, startDate?: string, endDate?: string): Promise<JournalEntry[]> {
		debugLog('getAccountLedger: Starting request', { accountCode, startDate, endDate });

		if (USE_MOCK_DATA) {
			let data = await MockDataService.getJournalEntries();
			data = data.filter(entry => entry.accountCode === accountCode);

			if (startDate) {
				data = data.filter(entry => entry.date >= startDate);
			}
			if (endDate) {
				data = data.filter(entry => entry.date <= endDate);
			}

			debugLog('getAccountLedger: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<JournalEntry[]>(`/general-ledger/accounts/${accountCode}/ledger`, {
				params: { startDate, endDate }
			});
			debugLog('getAccountLedger: API Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getAccountLedger: Error', error);
			throw error;
		}
	}
};
