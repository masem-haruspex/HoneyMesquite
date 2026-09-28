// generalLedger.ts
import type { BaseEntity } from "../commonTypes";

export interface Account extends BaseEntity {
    code: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    parentCode: string | null;
    normalBalance: 'DEBIT' | 'CREDIT';
    isActive: boolean;
}

export interface JournalEntry extends BaseEntity {
    journalEntryNumber: string;
    date: string;
    accountCode: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    referenceNumber: string;
    bankAccountId?: number;
    bankReference?: string;
    status: 'DRAFT' | 'POSTED' | 'VOID';
    reconciled: boolean;
    reconciledDate?: string;
    periodId?: number;
    postedBy?: string;
    approvedBy?: string;
}

export interface BankAccount extends BaseEntity {
    name: string;
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    accountType: 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET' | 'CREDIT_CARD';
    currency: string;
    openingBalance: number;
    currentBalance: number;
    lastReconciledDate?: string;
    isActive: boolean;
}

export interface BankStatement extends BaseEntity {
    bankAccountId: number;
    statementDate: string;
    periodStart: string;
    periodEnd: string;
    openingBalance: number;
    closingBalance: number;
    totalDeposits?: number;
    totalWithdrawals?: number;
    statementFileUrl?: string;
    importedBy?: string;
    status: 'PENDING' | 'PROCESSING' | 'RECONCILED' | 'ERROR';
}

export interface StatementLine extends BaseEntity {
    statementId: number;
    transactionDate: string;
    description: string;
    amount: number;
    balance?: number;
    reference?: string;
    transactionType?: string;
    isReconciled: boolean;
    journalEntryId?: number;
    matchConfidence?: number;
    notes?: string;
}

export interface ReconciliationSession extends BaseEntity {
    bankAccountId: number;
    statementId: number;
    startedBy: string;
    openingBookBalance: number;
    closingBookBalance: number;
    statementBalance: number;
    reconciledBalance: number;
    outstandingDeposits: number;
    outstandingWithdrawals: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
}

export interface AccountingPeriod extends BaseEntity {
    periodName: string;
    periodStart: string;
    periodEnd: string;
    periodType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
    status: 'OPEN' | 'CLOSED' | 'LOCKED';
    closedBy?: string;
    closedAt?: string;
}

export interface TrialBalanceItem {
    accountCode: string;
    accountName: string;
    type: string;
    totalDebits: number;
    totalCredits: number;
    balance: number;
}

export interface JournalEntryRequest {
    date: string;
    accountCode: string;
    description: string;
    debitAmount?: number;
    creditAmount?: number;
    referenceNumber?: string;
    bankAccountId?: number;
    bankReference?: string;
}

export interface AccountRequest {
    code: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    parentCode?: string;
    normalBalance: 'DEBIT' | 'CREDIT';
}

export interface BankAccountRequest {
    name: string;
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
    accountType: 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET' | 'CREDIT_CARD';
    currency?: string;
    openingBalance: number;
}

export interface BankStatementUploadRequest {
    bankAccountId: number;
    statementDate: string;
    periodStart: string;
    periodEnd: string;
    openingBalance: number;
    closingBalance: number;
    file?: File;
}
