import api from '../api';
import { MockDataService } from '../MockDataService';
import type { CollectionStage } from '../commonTypes';
import type {
  AccountsReceivable,
  Client,
  AccountsReceivableRequest,
  ClientRequest
} from './receivable';

// 🎯 Set to true to use mock data, false for real API
const USE_MOCK_DATA = true;

const DEBUG_PREFIX = '[ReceivableService]';
const debugLog = (message: string, data?: any) => {
  const DEBUG_MODE = false;
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`${DEBUG_PREFIX} [${timestamp}] ${message}`, data);
  }
};

export const ReceivableService = {
  async getAllClients(): Promise<Client[]> {
    debugLog('getAllClients: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getClients();
      debugLog('getAllClients: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<Client[]>('/receivables/clients');
      debugLog('getAllClients: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getAllClients: Error', error);
      throw error;
    }
  },

  async createClient(client: ClientRequest): Promise<Client> {
    debugLog('createClient: Starting request', client);

    if (USE_MOCK_DATA) {
      const newClient: Client = {
        id: Math.floor(Math.random() * 10000),
        name: client.legalName,
        creditRating: client.creditRating || 'B',
        paymentTerms: client.paymentTerms,
        lastPaymentDate: client.lastPaymentDate,
        createdAt: new Date().toISOString(),
      };
      debugLog('createClient: Mock Success', { id: newClient.id });
      return newClient;
    }

    try {
      const response = await api.post<Client>('/receivables/clients', client);
      debugLog('createClient: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('createClient: Error', error);
      throw error;
    }
  },

  async getReceivables(): Promise<AccountsReceivable[]> {
    debugLog('getReceivables: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getReceivables();
      debugLog('getReceivables: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<AccountsReceivable[]>('/receivables/');
      debugLog('getReceivables: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getReceivables: Error', error);
      throw error;
    }
  },

  async createReceivable(receivable: AccountsReceivableRequest): Promise<AccountsReceivable> {
    debugLog('createReceivable: Starting request', receivable);

    if (USE_MOCK_DATA) {
      const clients = await MockDataService.getClients();
      const client = clients.find(c => c.id === receivable.clientId) || clients[0];

      const newReceivable: AccountsReceivable = {
        id: Math.floor(Math.random() * 10000),
        client,
        invoiceNumber: receivable.invoiceNumber,
        amount: receivable.amount,
        issuedDate: receivable.issuedDate,
        dueDate: receivable.dueDate,
        daysLate: receivable.daysLate || 0,
        status: receivable.status || 'PENDING',
        collectionStage: receivable.collectionStage,
        probabilityOfPayment: receivable.probabilityOfPayment || 0.8,
        lastReminderDate: receivable.lastReminderDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      debugLog('createReceivable: Mock Success', { id: newReceivable.id });
      return newReceivable;
    }

    try {
      const response = await api.post<AccountsReceivable>('/receivables/', receivable);
      debugLog('createReceivable: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('createReceivable: Error', error);
      throw error;
    }
  },

  async updateCollectionStatus(id: number, status: CollectionStage): Promise<AccountsReceivable> {
    debugLog('updateCollectionStatus: Starting request', { id, status });

    if (USE_MOCK_DATA) {
      const allData = await MockDataService.getReceivables();
      const found = allData.find(item => item.id === id);
      if (!found) throw new Error('Receivable not found');

      const updated = {
        ...found,
        collectionStage: status,
        updatedAt: new Date().toISOString()
      };
      debugLog('updateCollectionStatus: Mock Success', { id });
      return updated;
    }

    try {
      const response = await api.put<AccountsReceivable>(
        `/receivables/${id}/status?status=${status}`
      );
      debugLog('updateCollectionStatus: API Success', { id });
      return response.data;
    } catch (error) {
      debugLog('updateCollectionStatus: Error', error);
      throw error;
    }
  },

  async getAgingReport(): Promise<AccountsReceivable[]> {
    debugLog('getAgingReport: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getReceivables();
      debugLog('getAgingReport: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<AccountsReceivable[]>('/receivables/aging/');
      debugLog('getAgingReport: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getAgingReport: Error', error);
      throw error;
    }
  }
};
