import type { BaseEntity } from "../commonTypes";

export interface ProfitLossFilterState {
  searchTerm: string;
  startDate: string;
  endDate: string;
  minNetIncome: string;
  maxNetIncome: string;
  minRevenue: string;
  maxRevenue: string;
  minMargin: string;
  maxMargin: string;
  isForecast: boolean | null; 
  sortBy: 'date' | 'netIncome' | 'revenue' | 'margin';
  sortDirection: 'asc' | 'desc';
  categoryFilters: Record<number, boolean>; 
}

export interface PLLineItem {
  id?: {
    statementId: number;
  };
  category: {
    id: number;
    name: string;
  };
  amount: string;
  varianceFromBudget?: string;
  notes?: string;
}

export interface ProfitLossStatement extends BaseEntity {
    id: number;
    departmentId: number | null;
    periodName: string;
    periodStart: string;
    periodEnd: string;
    revenue: string;
    cogs: string;
    grossProfit?: string;
    operatingExpenses: string;
    netIncome?: string;
    marginPercentage?: string;
    isForecast: boolean;
    version: number;
    createdAt: string;
    lineItems: PLLineItem[];
}

export interface ProfitLossRequest {
    departmentId: number | null;
    periodName: string;
    periodStart: string;
    periodEnd: string;
    revenue: string;
    cogs: string;
    operatingExpenses: string;
    isForecast: boolean;
    version?: number;
    lineItems: PLLineItem[];
}

export interface ProfitLossResponse {
    id: number;
    departmentId: number | null;
    periodName: string;
    periodStart: string;
    periodEnd: string;
    revenue: string;
    cogs: string;
    grossProfit?: string;
    operatingExpenses: string;
    netIncome?: string;
    marginPercentage?: string;
    isForecast: boolean;
    version: number;
    createdAt: string;
    lineItems: PLLineItem[];
}

export type CreateProfitLossDto = Omit<ProfitLossRequest, 'version'> & { version?: number };
export type UpdateProfitLossDto = Partial<ProfitLossRequest>;
