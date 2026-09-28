import api from '../api';
import { MockDataService } from '../MockDataService';
import type {
  CashFlowForecast,
  ForecastActual,
  RunwayDataPoint,
  RiskFactor,
  LiquidityEvent,
  ConfidenceDataPoint,
  Scenario,
} from './cashFlow';

const USE_MOCK_DATA = true;

const DEBUG_PREFIX = '[CashFlowService]';
const debugLog = (message: string, data?: any) => {
  const DEBUG_MODE = false;
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`${DEBUG_PREFIX} [${timestamp}] ${message}`, data);
  }
};

export const CashFlowService = {
  async getForecasts(start: string, end: string): Promise<CashFlowForecast[]> {
    debugLog('getForecasts: Starting request', { start, end });

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getCashFlowForecasts();
      debugLog('getForecasts: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<CashFlowForecast[]>(
        `/cashflow/forecasts/by-period?start=${start}&end=${end}`
      );
      debugLog('getForecasts: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getForecasts: Error', error);
      throw error;
    }
  },

  async createForecast(forecast: Omit<CashFlowForecast, 'id'>): Promise<CashFlowForecast> {
    debugLog('createForecast: Starting request', forecast);

    if (USE_MOCK_DATA) {
      const newForecast: CashFlowForecast = {
        id: Math.floor(Math.random() * 10000),
        ...forecast,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      debugLog('createForecast: Mock Success', { id: newForecast.id });
      return newForecast;
    }

    try {
      const payload = {
        ...forecast,
        assumptions: typeof forecast.assumptions === 'object'
          ? JSON.stringify(forecast.assumptions)
          : forecast.assumptions
      };
      const response = await api.post<CashFlowForecast>('/cashflow/forecasts/', payload);
      debugLog('createForecast: API Success', { id: response.data.id });
      return response.data;
    } catch (error) {
      debugLog('createForecast: Error', error);
      throw error;
    }
  },

  async compareScenarios(start: string, end: string): Promise<CashFlowForecast[]> {
    debugLog('compareScenarios: Starting request', { start, end });

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getCashFlowForecasts();
      debugLog('compareScenarios: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<CashFlowForecast[]>(
        `/cashflow/forecasts/compare?start=${start}&end=${end}`
      );
      debugLog('compareScenarios: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('compareScenarios: Error', error);
      throw error;
    }
  },

  async recordActual(actual: Omit<ForecastActual, 'id'>): Promise<ForecastActual> {
    debugLog('recordActual: Starting request', actual);

    if (USE_MOCK_DATA) {
      const newActual: ForecastActual = {
        ...actual,
        variance: actual.actualAmount - (actual.actualAmount * 0.9), 
        variancePercentage: 10,
      };
      debugLog('recordActual: Mock Success', newActual);
      return newActual;
    }

    try {
      const response = await api.post<ForecastActual>('/cashflow/actuals/', actual);
      debugLog('recordActual: API Success', { id: response.data.forecastId });
      return response.data;
    } catch (error) {
      debugLog('recordActual: Error', error);
      throw error;
    }
  },

  async getRunway(start?: string, end?: string): Promise<RunwayDataPoint[]> {
    debugLog('getRunway: Starting request', { start, end });

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getRunwayData();
      debugLog('getRunway: Mock Success', { count: data.length });
      return data;
    }

    try {
      const qs = start && end ? `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}` : '';
      const response = await api.get<any[]>(`/cashflow/runway/${qs}`);

      const processedData: RunwayDataPoint[] = response.data.map((r) => ({
        date: new Date(r.analysisDate),
        cashBalance: Number(r.cashBalance),
        burnRate: Number(r.burnRate),
        runwayMonths: Number(r.runwayMonths),
        fundingEvents: (r.fundingEvents || []).map((fe: any) => ({
          date: new Date(fe.date),
          amount: Number(fe.amount),
          name: fe.name,
        })),
      }));

      debugLog('getRunway: API Success', { count: processedData.length });
      return processedData;
    } catch (error) {
      debugLog('getRunway: Error', error);
      throw error;
    }
  },

  async getRisks(): Promise<RiskFactor[]> {
    debugLog('getRisks: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getRiskFactors();
      debugLog('getRisks: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<RiskFactor[]>('/cashflow/risks/');
      debugLog('getRisks: API Success', { count: response.data.length });
      return response.data;
    } catch (error) {
      debugLog('getRisks: Error', error);
      throw error;
    }
  },

  async getLiquidity(): Promise<LiquidityEvent[]> {
    debugLog('getLiquidity: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getLiquidityData();
      debugLog('getLiquidity: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<LiquidityEvent[]>('/cashflow/liquidity/');
      const processedData = response.data.map(item => ({
        ...item,
        date: new Date(item.date),
        criticalAccounts: item.criticalAccounts?.map(acc => ({
          ...acc,
          balance: Number(acc.balance),
          minThreshold: Number(acc.minThreshold)
        }))
      }));
      debugLog('getLiquidity: API Success', { count: processedData.length });
      return processedData;
    } catch (error) {
      debugLog('getLiquidity: Error', error);
      throw error;
    }
  },

  async getConfidence(): Promise<ConfidenceDataPoint[]> {
    debugLog('getConfidence: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getConfidenceData();
      debugLog('getConfidence: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<ConfidenceDataPoint[]>('/cashflow/confidence/');
      const processedData = response.data.map((item: any) => ({
        date: new Date(item.date),
        lowerBound: item.lowerBound,
        upperBound: item.upperBound,
        projectedAmount: item.projectedAmount,
        confidenceLevel: item.confidenceLevel,
        scenario: item.scenario || 'BASE_CASE',
        contributingFactors: item.factors?.map((f: any) => ({
          factor: f.factor,
          impact: Number(f.impact),
          confidence: Number(f.confidence),
        })),
      }));
      debugLog('getConfidence: API Success', { count: processedData.length });
      return processedData;
    } catch (error) {
      debugLog('getConfidence: Error', error);
      throw error;
    }
  },

  async getScenarioPlans(): Promise<Scenario[]> {
    debugLog('getScenarioPlans: Starting request');

    if (USE_MOCK_DATA) {
      const data = await MockDataService.getScenarioPlans();
      debugLog('getScenarioPlans: Mock Success', { count: data.length });
      return data;
    }

    try {
      const response = await api.get<any[]>('/cashflow/scenarios');

      const transformedScenarios: Scenario[] = response.data.map(rawScenario => ({
        name: rawScenario.name,
        probability: rawScenario.probability,
        expectedValue: rawScenario.expectedValue,
        nodes: rawScenario.nodes.map((node: any) => ({
          id: node.nodeId,
          type: node.type,
          data: {
            label: node.label,
            amount: node.amount,
            probability: node.probability,
            impact: node.impact,
          },
          position: {
            x: node.positionX,
            y: node.positionY,
          }
        })),
        edges: rawScenario.edges.map((edge: any) => ({
          id: edge.id.toString(),
          source: edge.source.nodeId,
          target: edge.target.nodeId,
          label: edge.label,
          animated: edge.animated,
        }))
      }));

      debugLog('getScenarioPlans: API Success', { count: transformedScenarios.length });
      return transformedScenarios;
    } catch (error) {
      debugLog('getScenarioPlans: Error', error);
      throw error;
    }
  }
};
