import api from '../api';
import { MockDataService } from '../MockDataService';
import type { Department, DepartmentPerformance } from './department';

const USE_MOCK_DATA = true;

const DEBUG_PREFIX = '[DepartmentService]';
const debugLog = (message: string, data?: any) => {
  const DEBUG_MODE = false;
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`${DEBUG_PREFIX} [${timestamp}] ${message}`, data);
  }
};

export const DepartmentService = {
  async getAllDepartments(): Promise<Department[]> {
    debugLog('getAllDepartments: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getDepartments();
      debugLog('getAllDepartments: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<Department[]>('/departments/');
      debugLog('getAllDepartments: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getAllDepartments: Error', error);
      throw error;
    }
  },

  async createDepartment(department: Omit<Department, 'id'>): Promise<Department> {
    debugLog('createDepartment: Starting request', department);

    if (USE_MOCK_DATA) {
      const newDept: Department = {
        id: Math.floor(Math.random() * 10000),
        ...department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      debugLog('createDepartment: Mock Success', { id: newDept.id });
      return newDept;
    }

    try {
      const response = await api.post<Department>('/departments/', department, {
        headers: { 'Content-Type': 'application/json' }
      });
      debugLog('createDepartment: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('createDepartment: Error', error);
      throw error;
    }
  },

  async getDepartmentPerformance(departmentId: number): Promise<DepartmentPerformance[]> {
    debugLog('getDepartmentPerformance: Starting request', { departmentId });

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getDepartmentPerformance(departmentId);
      debugLog('getDepartmentPerformance: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<DepartmentPerformance[]>(
        `/departments/${departmentId}/performance`
      );
      debugLog('getDepartmentPerformance: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getDepartmentPerformance: Error', error);
      throw error;
    }
  },

  async recordPerformance(
    departmentId: number,
    performance: Omit<DepartmentPerformance, 'id' | 'departmentId'>
  ): Promise<DepartmentPerformance> {
    debugLog('recordPerformance: Starting request', { departmentId, performance });

    if (USE_MOCK_DATA) {
      const newPerf: DepartmentPerformance = {
        id: Math.floor(Math.random() * 10000),
        departmentId,
        ...performance,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      debugLog('recordPerformance: Mock Success', { id: newPerf.id });
      return newPerf;
    }

    try {
      const payload = { ...performance, departmentId };
      const response = await api.post<DepartmentPerformance>('/departments/performance/', payload);
      debugLog('recordPerformance: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('recordPerformance: Error', error);
      throw error;
    }
  },

  async updatePerformance(
    id: number,
    performance: Partial<Omit<DepartmentPerformance, 'id'>>
  ): Promise<DepartmentPerformance> {
    debugLog('updatePerformance: Starting request', { id, performance });

    if (USE_MOCK_DATA) {
      debugLog('updatePerformance: Mock Success (no-op)', { id });
      return { id, departmentId: 1, recordedDate: new Date().toISOString(), spend: 0, revenue: 0, efficiency: 0, isCurrent: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }

    try {
      const response = await api.put<DepartmentPerformance>(`/departments/performance/${id}`, performance);
      debugLog('updatePerformance: API Success', { id });
      return response.data;
    } catch (error) {
      debugLog('updatePerformance: Error', error);
      throw error;
    }
  },

  async deletePerformance(id: number): Promise<void> {
    debugLog('deletePerformance: Starting request', { id });

    if (USE_MOCK_DATA) {
      debugLog('deletePerformance: Mock Success (no-op)', { id });
      return;
    }

    try {
      await api.delete(`/departments/performance/${id}`);
      debugLog('deletePerformance: API Success', { id });
    } catch (error) {
      debugLog('deletePerformance: Error', error);
      throw error;
    }
  }
};
