export type ForecastScenario = 'BEST_CASE' | 'BASE_CASE' | 'WORST_CASE';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'DISPUTED';
export type CollectionStage = 'PENDING' | 'REMINDER_SENT' | 'FINAL_NOTICE' | 'COLLECTIONS';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

export interface BaseEntity {
    id: number;
    createdAt?: string;
    updatedAt?: string;
}
