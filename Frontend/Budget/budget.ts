import type { BaseEntity, CategoryType, Quarter } from "../commonTypes";

export interface Category extends BaseEntity {
    name: string;
    type: CategoryType;
}

export interface BudgetAllocationRequest {
    departmentId: number;
    categoryId: number;
    fiscalYear: number;
    quarter: Quarter;
    budgetedAmount: number;
    isCurrent: boolean;
    version?: number; 
}
export interface BudgetAllocation extends BaseEntity {
    departmentId: number;
    categoryId: number;
    department?: { id: number; name: string };
    category?: { id: number; name: string };
    fiscalYear: number;
    quarter: Quarter;
    budgetedAmount: number;
    isCurrent: boolean;
    version: number;
}

export interface BudgetActualRequest {
    allocationId: number;
    recordedDate: string; 
    actualAmount: number;
    variance?: number;
    notes?: string;
}

export interface BudgetActual extends BaseEntity {
    allocationId: number;
    allocation?: BudgetAllocation; 
    recordedDate: string; 
    actualAmount: number;
    variance?: number;
    notes?: string;
}

export interface BudgetMonthlyBreakdownResponse {
    allocationId: number;
    departmentId: number;
    categoryId: number;
    fiscalYear: number;
    quarter: Quarter;
    totalBudget: number;
    categoryName: string;
    departmentName?: string; 
    monthlyAmounts: Record<string, number>; 

}

export interface BudgetVsActualResponse {
    allocationId: number;
    categoryId: number;
    categoryName: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    quarter: Quarter;
    departmentId?: number; 
    departmentName?: string; 
	fiscalYear: number;
}

export interface CategoryRequest {
    name: string;
    type: CategoryType;
    allocations?: BudgetAllocationRequest[];
}

export interface CategoryResponse extends Category {
    allocations?: BudgetAllocation[];
    createdAt: string; 
}

export interface CategoryWithAllocations extends Category {
    allocations: Array<{
        id: number;
        departmentId: number;
        fiscalYear: number;
        quarter: Quarter;
        budgetedAmount: number;
    }>;
}

