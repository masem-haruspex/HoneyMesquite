import api from '../api';
import { MockDataService } from '../MockDataService';
import type {
  Vendor,
  VendorContract,
  VendorInvoice,
  VendorContractVarianceResponse,
  CreateVendorRequest,
  CreateVendorContractRequest,
  CreateVendorInvoiceRequest,
  VendorResponse,
  VendorContractResponse,
  VendorInvoiceResponse
} from './vendor';

const USE_MOCK_DATA = true;

const DEBUG_PREFIX = '[VendorService]';
const debugLog = (message: string, data?: any) => {
  const DEBUG_MODE = false;
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`${DEBUG_PREFIX} [${timestamp}] ${message}`, data);
  }
};

export const VendorService = {
  async getAllVendors(): Promise<Vendor[]> {
    debugLog('getAllVendors: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getVendors();
      debugLog('getAllVendors: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<VendorResponse[]>('/vendors/');
      debugLog('getAllVendors: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getAllVendors: Error', error);
      throw error;
    }
  },

  async getVendorById(id: number): Promise<Vendor> {
    debugLog('getVendorById: Starting request', { id });

    if (USE_MOCK_DATA) {
      const allData = await MockDataService.getVendors();
      const found = allData.find(item => item.id === id);
      if (!found) throw new Error('Vendor not found');
      debugLog('getVendorById: Mock Success', { id });
      return found;
    }

    try {
      const response = await api.get<VendorResponse>(`/vendors/${id}`);
      debugLog('getVendorById: API Success', { id });
      return response.data;
    } catch (error) {
      debugLog('getVendorById: Error', error);
      throw error;
    }
  },

  async createVendor(vendor: CreateVendorRequest): Promise<Vendor> {
    debugLog('createVendor: Starting request', vendor);

    if (USE_MOCK_DATA) {
      const newVendor: Vendor = {
        id: Math.floor(Math.random() * 10000),
        legalName: vendor.legalName,
        industryClassification: vendor.industryClassification,
        marketRateReference: vendor.marketRateReference,
        createdAt: new Date().toISOString(),
      };
      debugLog('createVendor: Mock Success', { id: newVendor.id });
      return newVendor;
    }

    try {
      const response = await api.post<VendorResponse>('/vendors/', vendor);
      debugLog('createVendor: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('createVendor: Error', error);
      throw error;
    }
  },

  async updateVendor(id: number, vendor: CreateVendorRequest): Promise<Vendor> {
    debugLog('updateVendor: Starting request', { id, vendor });

    if (USE_MOCK_DATA) {
      const allData = await MockDataService.getVendors();
      const found = allData.find(item => item.id === id);
      if (!found) throw new Error('Vendor not found');
      const updated = { ...found, ...vendor };
      debugLog('updateVendor: Mock Success', { id });
      return updated;
    }

    try {
      const response = await api.put<VendorResponse>(`/vendors/${id}`, vendor);
      debugLog('updateVendor: API Success', { id });
      return response.data;
    } catch (error) {
      debugLog('updateVendor: Error', error);
      throw error;
    }
  },

  async deleteVendor(id: number): Promise<void> {
    debugLog('deleteVendor: Starting request', { id });

    if (USE_MOCK_DATA) {
      debugLog('deleteVendor: Mock Success (no-op)', { id });
      return;
    }

    try {
      await api.delete(`/vendors/${id}`);
      debugLog('deleteVendor: API Success', { id });
    } catch (error) {
      debugLog('deleteVendor: Error', error);
      throw error;
    }
  },

  async getAllContracts(): Promise<VendorContract[]> {
    debugLog('getAllContracts: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getVendorContracts();
      debugLog('getAllContracts: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<VendorContractResponse[]>('/vendor-contracts');
      debugLog('getAllContracts: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getAllContracts: Error', error);
      throw error;
    }
  },

  async getExpiringContracts(daysThreshold = 30): Promise<VendorContract[]> {
    debugLog('getExpiringContracts: Starting request', { daysThreshold });

    if (USE_MOCK_DATA) {
      const allData = await MockDataService.getVendorContracts();
      const now = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const filtered = allData.filter(c => {
        const endDate = new Date(c.contractEnd);
        return endDate <= thresholdDate && endDate >= now;
      });

      debugLog('getExpiringContracts: Mock Success', { count: filtered.length });
      return filtered;
    }

    try {
      const response = await api.get<VendorContractResponse[]>(
        `/vendor-contracts/expiring-soon?daysThreshold=${daysThreshold}`
      );
      debugLog('getExpiringContracts: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getExpiringContracts: Error', error);
      throw error;
    }
  },

  async getVarianceAnalysis(): Promise<VendorContractVarianceResponse[]> {
    debugLog('getVarianceAnalysis: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getVarianceAnalysis();
      debugLog('getVarianceAnalysis: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<VendorContractVarianceResponse[]>(
        '/vendor-contracts/variance-analysis'
      );
      debugLog('getVarianceAnalysis: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getVarianceAnalysis: Error', error);
      throw error;
    }
  },

  async createContract(contract: CreateVendorContractRequest): Promise<VendorContract> {
    debugLog('createContract: Starting request', contract);

    if (USE_MOCK_DATA) {
      const newContract: VendorContract = {
        id: Math.floor(Math.random() * 10000),
        ...contract,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      debugLog('createContract: Mock Success', { id: newContract.id });
      return newContract;
    }

    try {
      const response = await api.post<VendorContractResponse>('/vendor-contracts', contract);
      debugLog('createContract: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('createContract: Error', error);
      throw error;
    }
  },

  async createInvoice(contractId: number, invoice: CreateVendorInvoiceRequest): Promise<VendorInvoice> {
    debugLog('createInvoice: Starting request', { contractId, invoice });

    if (USE_MOCK_DATA) {
      const newInvoice: VendorInvoice = {
        id: Math.floor(Math.random() * 10000),
        contractId,
        invoiceDate: invoice.invoiceDate,
        amount: invoice.amount,
        paymentStatus: invoice.paymentStatus,
        marketRateAtPayment: invoice.marketRateAtPayment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      debugLog('createInvoice: Mock Success', { id: newInvoice.id });
      return newInvoice;
    }

    try {
      const response = await api.post<VendorInvoiceResponse>(
        `/vendor-contracts/${contractId}/invoices`,
        invoice
      );
      debugLog('createInvoice: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('createInvoice: Error', error);
      throw error;
    }
  },

  parseAmount(amount: string): number {
    return parseFloat(amount);
  },

  formatAmount(amount: number): string {
    return amount.toFixed(4);
  }
};
