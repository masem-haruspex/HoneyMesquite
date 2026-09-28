// src/Budget/BudgetService.ts
import api from '../api';
import { MockDataService } from '../MockDataService'; 
import type {
	BudgetActual,
		BudgetAllocation,
		BudgetMonthlyBreakdownResponse,
		BudgetVsActualResponse,
		CategoryResponse,
		CategoryRequest,
		Category,
		CategoryWithAllocations,
} from './budget';

const USE_MOCK_DATA = true;

const DEBUG_PREFIX = '[BudgetService]';
const debugLog = (message: string, data?: any) => {
	const DEBUG_MODE = false;
	if (DEBUG_MODE) {
		const timestamp = new Date().toISOString();
		const logMessage = `${DEBUG_PREFIX} [${timestamp}] ${message}`;
		if (data !== undefined) {
			console.log(logMessage, data);
		} else {
			console.log(logMessage);
		}
	}
};

export const BudgetService = {
	async getAllAllocations(): Promise<BudgetAllocation[]> {
		debugLog('getAllAllocations: Starting request');

		if (USE_MOCK_DATA) {
			const data = await MockDataService.getBudgetAllocations();
			debugLog('getAllAllocations: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<BudgetAllocation[]>('/budget/allocations/');
			debugLog('getAllAllocations: Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getAllAllocations: Error', error);
			throw error;
		}
	},

	async createAllocation(allocation: Omit<BudgetAllocation, 'id'>): Promise<BudgetAllocation> {
		debugLog('createAllocation: Starting request', allocation);

		if (USE_MOCK_DATA) {
			const newAlloc: BudgetAllocation = {
				id: Math.floor(Math.random() * 10000),
				...allocation,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('createAllocation: Mock Success', { id: newAlloc.id });
			return newAlloc;
		}

		try {
			const data = {
				...allocation,
				version: allocation.version || 1
			};
			const response = await api.post<BudgetAllocation>('/budget/allocations/', data);
			debugLog('createAllocation: Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('createAllocation: Error', error);
			throw error;
		}
	},

	async updateAllocation(id: number, allocation: Partial<BudgetAllocation>): Promise<BudgetAllocation> {
		debugLog(`updateAllocation: Starting request for ID ${id}`, allocation);

		if (USE_MOCK_DATA) {
			const allData = await MockDataService.getBudgetAllocations();
			const found = allData.find(item => item.id === id);
			if (!found) throw new Error('Allocation not found');
			const updated = { ...found, ...allocation, updatedAt: new Date().toISOString() };
			debugLog('updateAllocation: Mock Success', { id });
			return updated;
		}

		try {
			const response = await api.put<BudgetAllocation>(`/budget/allocations/${id}`, allocation);
			debugLog(`updateAllocation: Success for ID ${id}`);
			return response.data;
		} catch (error) {
			debugLog(`updateAllocation: Error for ID ${id}`, error);
			throw error;
		}
	},

	async createActual(actual: Omit<BudgetActual, 'id'>): Promise<BudgetActual> {
		debugLog('createActual: Starting request', actual);

		if (USE_MOCK_DATA) {
			const newActual: BudgetActual = {
				id: Math.floor(Math.random() * 10000),
				...actual,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			debugLog('createActual: Mock Success', { id: newActual.id });
			return newActual;
		}

		try {
			const response = await api.post<BudgetActual>('/budget/actuals/', actual);
			debugLog('createActual: Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('createActual: Error', error);
			throw error;
		}
	},

	async getMonthlyBreakdown(departmentId?: number, fiscalYear?: number, quarter?: string): Promise<BudgetMonthlyBreakdownResponse[]> {
		debugLog('getMonthlyBreakdown: Starting request', { departmentId, fiscalYear, quarter });

		if (USE_MOCK_DATA) {
			return [];
		}

		try {
			const params = new URLSearchParams();
			if (departmentId) params.append('departmentId', departmentId.toString());
			if (fiscalYear) params.append('fiscalYear', fiscalYear.toString());
			if (quarter) params.append('quarter', quarter);
			const response = await api.get(`/budget/monthly-breakdown?${params.toString()}`);
			debugLog('getMonthlyBreakdown: Success', { count: response.data.length });
			return response.data;
		} catch (error) {
			debugLog('getMonthlyBreakdown: Error', error);
			throw error;
		}
	},

	async getBudgetVsActual(
		_departmentId: number | null, 
		_fiscalYear: number           
	): Promise<BudgetVsActualResponse[]> {
		debugLog('getBudgetVsActual: Starting request', { _departmentId, _fiscalYear });

		if (USE_MOCK_DATA) {
			const data = await MockDataService.getBudgetVsActual(_departmentId, _fiscalYear);
			debugLog('getBudgetVsActual: Mock Success', { count: data.length });
			return data;
		}

		try {
			const params: { departmentId?: number; fiscalYear: number } = { fiscalYear: _fiscalYear };
			if (_departmentId !== null && _departmentId !== undefined) {
				params.departmentId = _departmentId;
			}
			const response = await api.get<BudgetVsActualResponse[]>('/budget/vs-actual', { params });
			debugLog('getBudgetVsActual: API Response Received', { status: response.status, statusText: response.statusText });
			debugLog('getBudgetVsActual: Data Parsed', { count: response.data.length, sample: response.data.slice(0, 2) });
			return response.data;
		} catch (error: any) {
			if (error.response) {
				debugLog('getBudgetVsActual: API Error Response', {
					status: error.response.status,
					statusText: error.response.statusText,
					data: error.response.data,
					headers: error.response.headers,
				});
			} else if (error.request) {
				debugLog('getBudgetVsActual: No Response Received', { request: error.request });
			} else {
				debugLog('getBudgetVsActual: Request Setup Error', { message: error.message });
			}
			debugLog('getBudgetVsActual: Error Thrown', error);
			throw error;
		}
	},

	async getAllCategories(): Promise<Category[]> {
		debugLog('getAllCategories: Starting request');

		if (USE_MOCK_DATA) {
			const data = await MockDataService.getCategories();
			debugLog('getAllCategories: Mock Success', { count: data.length });
			return data;
		}

		try {
			const response = await api.get<CategoryResponse[]>('/categories/');
			const categories: Category[] = response.data.map(category => ({
				id: category.id,
				name: category.name,
				type: category.type,
				createdAt: category.createdAt
			}));
			debugLog('getAllCategories: Success', { count: categories.length });
			return categories;
		} catch (error) {
			debugLog('getAllCategories: Error', error);
			throw error;
		}
	},

	async getCategoryById(id: number): Promise<CategoryResponse> {
		debugLog(`getCategoryById: Starting request for ID ${id}`);

		if (USE_MOCK_DATA) {
			const allCats = await MockDataService.getCategories();
			const found = allCats.find(c => c.id === id);
			if (!found) throw new Error('Category not found');
			return { ...found, createdAt: new Date().toISOString() } as CategoryResponse;
		}

		try {
			const response = await api.get<CategoryResponse>(`/categories/${id}`);
			debugLog(`getCategoryById: Success for ID ${id}`);
			return response.data;
		} catch (error) {
			debugLog(`getCategoryById: Error for ID ${id}`, error);
			throw error;
		}
	},

	async createCategory(category: CategoryRequest): Promise<CategoryResponse> {
		debugLog('createCategory: Starting request', category);

		if (USE_MOCK_DATA) {
			const newCat: CategoryResponse = {
				id: Math.floor(Math.random() * 10000),
				name: category.name,
				type: category.type,
				allocations: undefined,
				createdAt: new Date().toISOString(),
			};
			debugLog('createCategory: Mock Success', { id: newCat.id });
			return newCat;
		}

		try {
			const response = await api.post<CategoryResponse>('/categories/', category);
			debugLog('createCategory: Success', { id: response.data.id });
			return response.data;
		} catch (error) {
			debugLog('createCategory: Error', error);
			throw error;
		}
	},

	async updateCategory(id: number, category: CategoryRequest): Promise<CategoryResponse> {
		debugLog(`updateCategory: Starting request for ID ${id}`, category);

		if (USE_MOCK_DATA) {
			const allCats = await MockDataService.getCategories();
			const found = allCats.find(c => c.id === id);
			if (!found) throw new Error('Category not found');
			const updated = { ...found, ...category } as CategoryResponse;
			debugLog('updateCategory: Mock Success', { id });
			return updated;
		}

		try {
			const response = await api.put<CategoryResponse>(`/categories/${id}`, category);
			debugLog(`updateCategory: Success for ID ${id}`);
			return response.data;
		} catch (error) {
			debugLog(`updateCategory: Error for ID ${id}`, error);
			throw error;
		}
	},

	async deleteCategory(id: number): Promise<void> {
		debugLog(`deleteCategory: Starting request for ID ${id}`);

		if (USE_MOCK_DATA) {
			debugLog('deleteCategory: Mock Success (no-op)', { id });
			return;
		}

		try {
			await api.delete(`/categories/${id}`);
			debugLog(`deleteCategory: Success for ID ${id}`);
		} catch (error) {
			debugLog(`deleteCategory: Error for ID ${id}`, error);
			throw error;
		}
	},

	async getCategoryWithAllocations(categoryId: number): Promise<CategoryWithAllocations> {
		debugLog(`getCategoryWithAllocations: Starting request for ID ${categoryId}`);

		if (USE_MOCK_DATA) {
			const cats = await MockDataService.getCategories();
			const allocs = await MockDataService.getBudgetAllocations();
			const cat = cats.find(c => c.id === categoryId);
			if (!cat) throw new Error('Category not found');

			return {
				...cat,
				allocations: allocs.filter(a => a.categoryId === categoryId).map(a => ({
					id: a.id,
					departmentId: a.departmentId,
					fiscalYear: a.fiscalYear,
					quarter: a.quarter,
					budgetedAmount: a.budgetedAmount
				}))
			} as CategoryWithAllocations;
		}

		try {
			const response = await api.get<CategoryWithAllocations>(`/categories/${categoryId}/allocations`);
			debugLog(`getCategoryWithAllocations: Success for ID ${categoryId}`);
			return response.data;
		} catch (error) {
			debugLog(`getCategoryWithAllocations: Error for ID ${categoryId}`, error);
			throw error;
		}
	}
};
