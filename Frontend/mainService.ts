// DataLoaderService.ts
import { BudgetService } from './Budget/BudgetService';
import { CashFlowService } from './CashFlow/CashFlowService';
import { DepartmentService } from './Departments/DepartmentService';
import { ProfitLossService } from './ProfitLoss/ProfitLossService';
import { ReceivableService } from './Receivables/ReceivableService';
import { VendorService } from './Vendor/VendorService';

export const MainService = {
  async loadAllData() {
    try {
      const [
        budgets,
        cashFlow,
        departments,
        profitLoss,
        receivables,
        vendors
      ] = await Promise.allSettled([
        BudgetService.getAllAllocations().catch(error => {
          console.error('Budget data loading failed:', error);
          return [];
        }),
        CashFlowService.getForecasts(
          `${new Date().getFullYear()}-01-01`,
          `${new Date().getFullYear()}-12-31`
        ).catch(error => {
          console.error('Cash flow data loading failed:', error);
          return [];
        }),
        DepartmentService.getAllDepartments().catch(error => {
          console.error('Department data loading failed:', error);
          return [];
        }),
        ProfitLossService.getAll().catch(error => {
          console.error('Profit/Loss data loading failed:', error);
          return [];
        }),
        ReceivableService.getReceivables().catch(error => {
          console.error('Receivables data loading failed:', error);
          return [];
        }),
        VendorService.getAllVendors().catch(error => {
          console.error('Vendor data loading failed:', error);
          return [];
        })
      ]);

      return {
        budgets: budgets.status === 'fulfilled' ? budgets.value : [],
        cashFlow: cashFlow.status === 'fulfilled' ? cashFlow.value : [],
        departments: departments.status === 'fulfilled' ? departments.value : [],
        profitLoss: profitLoss.status === 'fulfilled' ? profitLoss.value : [],
        receivables: receivables.status === 'fulfilled' ? receivables.value : [],
        vendors: vendors.status === 'fulfilled' ? vendors.value : []
      };
    } catch (error) {
      console.error('Failed to load application data:', error);
      throw error;
    }
  }
};
