import api from '../api';
import { MockDataService } from '../MockDataService';
import type {
  ProfitLossStatement,
  ProfitLossRequest,
  ProfitLossResponse,
  CreateProfitLossDto,
  UpdateProfitLossDto
} from './profitLoss';

const USE_MOCK_DATA = true;

const DEBUG_PREFIX = '[ProfitLossService]';
const debugLog = (message: string, data?: any) => {
  const DEBUG_MODE = false;
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`${DEBUG_PREFIX} [${timestamp}] ${message}`, data);
  }
};

const mapResponseToStatement = (response: ProfitLossResponse): ProfitLossStatement => {
  return {
    ...response,
    lineItems: response.lineItems || []
  };
};

export const ProfitLossService = {
  async getAll(): Promise<ProfitLossStatement[]> {
    debugLog('getAll: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getProfitLossStatements();
      debugLog('getAll: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<ProfitLossResponse[]>('/profitloss/');
      const data = Array.isArray(response.data) ? response.data : [];
      const mapped = data.map(mapResponseToStatement);
      debugLog('getAll: API Success', { count: mapped.length });
      return mapped;
    } catch (error) {
      debugLog('getAll: Error', error);
      throw error;
    }
  },

  async getByDepartment(departmentId: number): Promise<ProfitLossStatement[]> {
    debugLog('getByDepartment: Starting request', { departmentId });

    if (USE_MOCK_DATA) {
      const allData = await MockDataService.getProfitLossStatements();
      const filtered = allData.filter(item => item.departmentId === departmentId);
      debugLog('getByDepartment: Mock Success', { count: filtered.length });
      return filtered;
    }

    try {
      const response = await api.get<ProfitLossResponse[]>(`/profitloss/department/${departmentId}`);
      const mapped = response.data.map(mapResponseToStatement);
      debugLog('getByDepartment: API Success', { count: mapped.length });
      return mapped;
    } catch (error) {
      debugLog('getByDepartment: Error', error);
      throw error;
    }
  },

  async getById(id: number): Promise<ProfitLossStatement> {
    debugLog('getById: Starting request', { id });

    if (USE_MOCK_DATA) {
      const allData = await MockDataService.getProfitLossStatements();
      const found = allData.find(item => item.id === id);
      if (!found) throw new Error('Statement not found');
      debugLog('getById: Mock Success', { id });
      return found;
    }

    try {
      const response = await api.get<ProfitLossResponse>(`/profitloss/${id}`);
      const mapped = mapResponseToStatement(response.data);
      debugLog('getById: API Success', { id });
      return mapped;
    } catch (error) {
      debugLog('getById: Error', error);
      throw error;
    }
  },

  async create(createDto: CreateProfitLossDto): Promise<ProfitLossStatement> {
    debugLog('create: Starting request', createDto);

    if (USE_MOCK_DATA) {
      const newStatement: ProfitLossStatement = {
        id: Math.floor(Math.random() * 10000),
        ...createDto,
        version: createDto.version || 1,
        grossProfit: (parseFloat(createDto.revenue) - parseFloat(createDto.cogs)).toString(),
        netIncome: (parseFloat(createDto.revenue) - parseFloat(createDto.cogs) - parseFloat(createDto.operatingExpenses)).toString(),
        marginPercentage: ((parseFloat(createDto.revenue) - parseFloat(createDto.cogs) - parseFloat(createDto.operatingExpenses)) / parseFloat(createDto.revenue) * 100).toFixed(2),
        createdAt: new Date().toISOString(),
        lineItems: createDto.lineItems || [],
      };
      debugLog('create: Mock Success', { id: newStatement.id });
      return newStatement;
    }

    try {
      const request: ProfitLossRequest = {
        ...createDto,
        version: createDto.version || 1
      };
      const response = await api.post<ProfitLossResponse>('/profitloss/', request);
      const mapped = mapResponseToStatement(response.data);
      debugLog('create: API Success', { id: mapped.id });
      return mapped;
    } catch (error) {
      debugLog('create: Error', error);
      throw error;
    }
  },

  async update(id: number, updateDto: UpdateProfitLossDto): Promise<ProfitLossStatement> {
    debugLog('update: Starting request', { id, updateDto });

    if (USE_MOCK_DATA) {
      const allData = await MockDataService.getProfitLossStatements();
      const found = allData.find(item => item.id === id);
      if (!found) throw new Error('Statement not found');
      const updated = { ...found, ...updateDto };
      debugLog('update: Mock Success', { id });
      return updated;
    }

    try {
      const response = await api.patch<ProfitLossResponse>(`/profitloss/${id}`, updateDto);
      const mapped = mapResponseToStatement(response.data);
      debugLog('update: API Success', { id });
      return mapped;
    } catch (error) {
      debugLog('update: Error', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    debugLog('delete: Starting request', { id });

    if (USE_MOCK_DATA) {
      debugLog('delete: Mock Success (no-op)', { id });
      return;
    }

    try {
      await api.delete(`/profitloss/${id}`);
      debugLog('delete: API Success', { id });
    } catch (error) {
      debugLog('delete: Error', error);
      throw error;
    }
  }
};
