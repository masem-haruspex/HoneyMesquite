// cashFlow.ts
import type { BaseEntity, ForecastScenario } from "../commonTypes";

export interface CashFlowForecast extends BaseEntity {
  scenario: ForecastScenario;
  forecastDate: string;
  periodStart: string;
  periodEnd: string;
  projectedAmount: number;
  confidenceInterval?: number;
  burnRate?: number;
  assumptions?: Record<string, unknown>;
}

export interface ForecastActual {
  forecastId: number;
  actualDate: string;
  actualAmount: number;
  variance?: number;
  variancePercentage?: number;
}

export interface RunwayDataPoint {
  date: Date;
  cashBalance: number;
  burnRate: number;
  runwayMonths: number;
  fundingEvents?: {
    date: Date;
    amount: number;
    name: string;
  }[];
}

export interface RiskFactor {
  id: string;
  name: string;
  likelihood: number; 
  impact: number; 
  velocity?: number; 
  mitigation?: string;
}

export interface LiquidityEvent {
  date: Date;
  cashIn: number;
  cashOut: number;
  netFlow: number;
  balance: number;
  criticalAccounts?: {
    name: string;
    balance: number;
    minThreshold: number;
  }[];
}

export interface ConfidenceDataPoint {
  date: Date;
  lowerBound: number;
  upperBound: number;
  projectedAmount: number;
  confidenceLevel: number;
  contributingFactors?: {
    factor: string;
    impact: number; 
    confidence: number; 
  }[];
  scenario: 'BEST_CASE' | 'BASE_CASE' | 'WORST_CASE'; 

}

export interface Scenario {
  name: string;
  nodes: {
    id: string;
    type: 'input' | 'output' | 'default';
    data: {
      label: string;
      amount?: number;
      probability?: number;
      impact?: 'positive' | 'negative' | 'neutral';
    };
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
  }[];
  probability: number;
  expectedValue: number;
}

export interface RawScenarioNode {
  scenario: number; 
  nodeId: string;
  type: 'input' | 'output' | 'default';
  label: string;
  amount?: number;
  probability?: number;
  impact?: 'positive' | 'negative' | 'neutral';
  positionX: number;
  positionY: number;
}

export interface RawScenarioEdge {
  id: number; 
  source: RawScenarioNode; 
  target: RawScenarioNode; 
  label?: string;
  animated?: boolean;
}

export interface RawScenario {
  id: number; 
  name: string;
  probability: number;
  expectedValue: number;
  nodes: RawScenarioNode[];
  edges: RawScenarioEdge[];
}
