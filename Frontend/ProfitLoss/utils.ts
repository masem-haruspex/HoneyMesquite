import type { ProfitLossStatement, ProfitLossFilterState } from './profitLoss';
import type { BudgetVsActualResponse } from '../Budget/budget';

export const DEFAULT_FILTERS: ProfitLossFilterState = {
  searchTerm: '',
  startDate: '',
  endDate: '',
  minNetIncome: '',
  maxNetIncome: '',
  minRevenue: '',
  maxRevenue: '',
  minMargin: '',
  maxMargin: '',
  isForecast: null,
  sortBy: 'date',
  sortDirection: 'desc',
  categoryFilters: {},
};

export function applyFilters(statements: ProfitLossStatement[], filters: ProfitLossFilterState) {
  const {
    searchTerm,
    startDate,
    endDate,
    minNetIncome,
    maxNetIncome,
    minRevenue,
    maxRevenue,
    minMargin,
    maxMargin,
    isForecast,
    sortBy,
    sortDirection,
    categoryFilters,
  } = filters;

  return statements
    .filter((stmt) => {
      if (
        searchTerm &&
        !stmt.periodName.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;

      if (startDate && new Date(stmt.periodStart) < new Date(startDate)) return false;
      if (endDate && new Date(stmt.periodEnd) > new Date(endDate)) return false;

      const netIncome = parseFloat(stmt.netIncome || '0');
      const revenue = parseFloat(stmt.revenue);
      const margin = parseFloat(stmt.marginPercentage || '0');

      if (minNetIncome && netIncome < parseFloat(minNetIncome)) return false;
      if (maxNetIncome && netIncome > parseFloat(maxNetIncome)) return false;

      if (minRevenue && revenue < parseFloat(minRevenue)) return false;
      if (maxRevenue && revenue > parseFloat(maxRevenue)) return false;

      if (minMargin && margin < parseFloat(minMargin)) return false;
      if (maxMargin && margin > parseFloat(maxMargin)) return false;

      if (isForecast !== null && stmt.isForecast !== isForecast) return false;

      const hasEnabledCategory = stmt.lineItems.some(
        (item) => categoryFilters[item.category.id] !== false
      );
      if (Object.keys(categoryFilters).length > 0 && !hasEnabledCategory) return false;

      return true;
    })
    .sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortBy) {
        case 'date':
          aVal = new Date(a.periodStart).getTime();
          bVal = new Date(b.periodStart).getTime();
          break;
        case 'netIncome':
          aVal = parseFloat(a.netIncome || '0');
          bVal = parseFloat(b.netIncome || '0');
          break;
        case 'revenue':
          aVal = parseFloat(a.revenue);
          bVal = parseFloat(b.revenue);
          break;
        case 'margin':
          aVal = parseFloat(a.marginPercentage || '0');
          bVal = parseFloat(b.marginPercentage || '0');
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
}


export interface YTDData {
  revenue: number;
  grossProfit: number;
  netIncome: number;
  marginPercentage: number;
}

export interface RollingData {
  labels: string[];
  revenue: number[];
  netIncome: number[];
}

export interface BudgetComparison {
  revenue: {
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
  };
  operatingExpenses: {
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
  };
}

const extractYear = (periodName: string): number => {
  const match = periodName.match(/(\d{4})$/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
};

export const getYTDData = (statements: ProfitLossStatement[], selectedStatement: ProfitLossStatement): YTDData => {
  const selectedYear = extractYear(selectedStatement.periodName);
  const selectedQuarter = selectedStatement.periodName.split('-')[0];

  const quartersInOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
  const cutoffIndex = quartersInOrder.indexOf(selectedQuarter);

  const ytdStatements = statements.filter(s => {
    const year = extractYear(s.periodName);
    const quarter = s.periodName.split('-')[0];
    const qIndex = quartersInOrder.indexOf(quarter);
    return year === selectedYear && qIndex <= cutoffIndex;
  });

  const totalRevenue = ytdStatements.reduce((sum, s) => sum + parseFloat(s.revenue), 0);
  const totalCOGS = ytdStatements.reduce((sum, s) => sum + parseFloat(s.cogs), 0);
  const totalOpEx = ytdStatements.reduce((sum, s) => sum + parseFloat(s.operatingExpenses), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netIncome = grossProfit - totalOpEx;
  const marginPercentage = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  return {
    revenue: totalRevenue,
    grossProfit,
    netIncome,
    marginPercentage,
  };
};

export const getRolling12Months = (statements: ProfitLossStatement[]): RollingData => {
  const sorted = [...statements]
    .sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime())
    .slice(-12); 

  return {
    labels: sorted.map(s => s.periodName),
    revenue: sorted.map(s => parseFloat(s.revenue)),
    netIncome: sorted.map(s => parseFloat(s.netIncome || '0')),
  };
};

export const getBudgetComparison = (
  plStatement: ProfitLossStatement,
  budgetData: BudgetVsActualResponse[]
): BudgetComparison => {
  const revenueBudget = budgetData
    .filter(b => b.categoryName.toLowerCase().includes('revenue'))
    .reduce((sum, b) => sum + b.budgetedAmount, 0);

  const opexBudget = budgetData
    .filter(b => !b.categoryName.toLowerCase().includes('revenue'))
    .reduce((sum, b) => sum + b.budgetedAmount, 0);

  const actualRevenue = parseFloat(plStatement.revenue);
  const actualOpEx = parseFloat(plStatement.operatingExpenses);

  return {
    revenue: {
      budgeted: revenueBudget,
      actual: actualRevenue,
      variance: actualRevenue - revenueBudget,
      variancePercent: revenueBudget > 0 ? ((actualRevenue - revenueBudget) / revenueBudget) * 100 : 0,
    },
    operatingExpenses: {
      budgeted: opexBudget,
      actual: actualOpEx,
      variance: actualOpEx - opexBudget,
      variancePercent: opexBudget > 0 ? ((actualOpEx - opexBudget) / opexBudget) * 100 : 0,
    },
  };
};
