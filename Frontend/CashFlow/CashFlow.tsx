// CashFlow.tsx
import { Html } from '@react-three/drei';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { useAtom } from 'jotai';
import { CashFlowService } from './CashFlowService';
import { GeneralLedgerService } from '../GeneralLedger/GeneralLedgerService';
import type {
  CashFlowForecast,
    ForecastActual,
    LiquidityEvent,
    ConfidenceDataPoint,
    Scenario,
    RiskFactor,
    RunwayDataPoint,
} from './cashFlow';
import CashFlowOverview from            './components/CashFlowOverview';
import CashFlowBurnRate from            './components/CashFlowBurnRate';
import CashFlowRunway from              './components/CashFlowRunway';
import CashFlowConfidenceIntervals from './components/CashFlowConfidenceIntervals';
import CashFlowScenarioPlanner from     './components/CashFlowScenarioPlanner';
import CashFlowRiskMatrix from          './components/CashFlowRiskMatrix';
import CashFlowLiquidityEngine from     './components/CashFlowLiquidityEngine';
import "./CashFlow.scss";
import { atom } from 'jotai';
import { cashFlowDataAtom, loadingAtom } from '../atoms/dataAtoms';
import { ReactFlowProvider } from 'reactflow';
import type { BankAccount, BankStatement, JournalEntry } from '../GeneralLedger/generalLedger';
import BankReconciliation from './components/BankReconciliation';

export type TimeRange = '1m' | '3m' | '6m' | '12m' | 'all' | 'custom';

interface ExtendedCashFlowForecast extends CashFlowForecast {
  runwayMonths?: number;
}

interface CashFlowDataPoint {
  date: Date;
  projectedAmount: number;
  burnRate?: number;
  runwayMonths?: number;
}

export const forecastsAtom = atom<ExtendedCashFlowForecast[]>([]);
export const actualsAtom = atom<ForecastActual[]>([]);
export const errorAtom = atom<string | null>(null);
export const activeTabAtom = atom<'overview' | 'burn' | 'runway' | 'confidence' | 'scenarios' | 'risk' | 'liquidity' | 'bank-reconciliation'>('overview');
export const liquidityAtom = atom<LiquidityEvent[]>([]);
export const confidenceAtom = atom<ConfidenceDataPoint[]>([]);
export const risksAtom = atom<RiskFactor[]>([]);
export const runwayAtom = atom<RunwayDataPoint[]>([]);
export const scenariosAtom = atom<Scenario[]>([]);

const bankAccountsAtom = atom<BankAccount[]>([]);
const bankStatementsAtom = atom<BankStatement[]>([]);
const bankJournalEntriesAtom = atom<JournalEntry[]>([]);

export const currentConfidenceAtom = atom((get) => {
  const conf = get(confidenceAtom);
  return conf.length ? conf[conf.length - 1].confidenceLevel : 0;
});

export default function CashFlow({ position }: { position: [number, number, number] }) {
  const [globalCashFlowData] = useAtom(cashFlowDataAtom);
  const [appLoading] = useAtom(loadingAtom);

  const [forecasts, setForecasts] = useAtom(forecastsAtom);
  const [, setActuals] = useAtom(actualsAtom);
  const [loading, setLoading] = useState(true);
  const [, setError] = useAtom(errorAtom);
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [currentConfidence] = useAtom(currentConfidenceAtom);
  const [liquidityData, setLiquidityData] = useAtom(liquidityAtom);
  const [confidenceData, setConfidenceData] = useAtom(confidenceAtom);
  const [risks, setRisks] = useAtom(risksAtom);
  const [scenarios, setScenarios] = useAtom(scenariosAtom);
  const [rawRunwayData] = useAtom(runwayAtom);
  const [runwayData, setRunwayData] = useState<RunwayDataPoint[]>([]);

  const [bankAccounts, setBankAccounts] = useAtom(bankAccountsAtom);
  const [bankStatements, setBankStatements] = useAtom(bankStatementsAtom);
  const [bankJournalEntries, setBankJournalEntries] = useAtom(bankJournalEntriesAtom);
  const [bankReconciliationLoading, setBankReconciliationLoading] = useState(false);


  useEffect(() => { setRunwayData(rawRunwayData); }, [rawRunwayData]);

  const currentRunway = useMemo(() =>
  runwayData.length > 0 ? runwayData[runwayData.length - 1].runwayMonths : 0,
[runwayData]);

const currentBurnRate = useMemo(() =>
  runwayData.length > 0 ? runwayData[runwayData.length - 1].burnRate : 0,
[runwayData]);

  useEffect(() => {
    if (activeTab === 'bank-reconciliation') {
      loadBankReconciliationData();
    }
  }, [activeTab]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (globalCashFlowData.length > 0) {
          setForecasts(globalCashFlowData as ExtendedCashFlowForecast[]);

          const [liquidityResponse, confidenceResponse, risksResponse, runwayResponse, scenariosResponse] = await Promise.all([
            CashFlowService.getLiquidity(),
            CashFlowService.getConfidence(),
            CashFlowService.getRisks(),
            CashFlowService.getRunway(),
            CashFlowService.getScenarioPlans()
          ]);

          setLiquidityData(liquidityResponse);
          setConfidenceData(confidenceResponse);
          setRisks(risksResponse);
          setRunwayData(runwayResponse);
          setScenarios(scenariosResponse);

          setActuals(globalCashFlowData.map((f: ExtendedCashFlowForecast) => ({
            forecastId: f.id,
            actualDate: f.periodStart,
            actualAmount: f.projectedAmount * (0.8 + Math.random() * 0.4),
            variance: f.projectedAmount * (0.2 - Math.random() * 0.4),
            variancePercentage: (20 - Math.random() * 40)
          })));
        } else {
          const currentYear = new Date().getFullYear();
          const dateRange = {
            start: `${currentYear}-01-01`,
            end: `${currentYear}-12-31`
          };

          const data = await Promise.all([
            CashFlowService.getForecasts(dateRange.start, dateRange.end),
            CashFlowService.getLiquidity(),
            CashFlowService.getConfidence(),
            CashFlowService.getRisks(),
            CashFlowService.getRunway(),
            CashFlowService.getScenarioPlans()
          ]);

          const [forecastsResponse, liquidityResponse, confidenceResponse, risksResponse, runwayResponse, scenariosResponse] = data;

          setForecasts(forecastsResponse);
          setLiquidityData(liquidityResponse);
          setConfidenceData(confidenceResponse);
          setRisks(risksResponse);
          setRunwayData(runwayResponse);
          setScenarios(scenariosResponse);

          setActuals(forecastsResponse.map((f: ExtendedCashFlowForecast) => ({
            forecastId: f.id,
            actualDate: f.periodStart,
            actualAmount: f.projectedAmount * (0.8 + Math.random() * 0.4),
            variance: f.projectedAmount * (0.2 - Math.random() * 0.4),
            variancePercentage: (20 - Math.random() * 40)
          })));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [globalCashFlowData, setForecasts, setActuals, setError, setLiquidityData,
    setConfidenceData, setRisks, setRunwayData, setScenarios]);

  const loadBankReconciliationData = async () => {
    setBankReconciliationLoading(true);
    try {
      const [accounts, statements, entries] = await Promise.all([
        getBankAccounts(),
        getBankStatements(),
        getUnreconciledJournalEntries()
      ]);

      setBankAccounts(accounts);
      setBankStatements(statements);
      setBankJournalEntries(entries);
    } catch (err) {
      console.error('Error loading bank reconciliation data:', err);
    } finally {
      setBankReconciliationLoading(false);
    }
  };

  const getBankAccounts = async (): Promise<BankAccount[]> => {
    try {
      if ('getBankAccounts' in CashFlowService) {
        return await (CashFlowService as any).getBankAccounts();
      }
      return await GeneralLedgerService.getBankAccounts();
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      return [];
    }
  };

  const getBankStatements = async (): Promise<BankStatement[]> => {
    try {
      if ('getBankStatements' in CashFlowService) {
        return await (CashFlowService as any).getBankStatements();
      }
      return [];
    } catch (error) {
      console.error('Error loading bank statements:', error);
      return [];
    }
  };

  const getUnreconciledJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const entries = await GeneralLedgerService.getJournalEntries({
      status: 'POSTED',
    });
    return entries.filter(je => je.bankAccountId !== undefined && !je.reconciled);
  } catch (error) {
    console.error('Error loading journal entries:', error);
    return [];
  }
};

  const handleUploadStatement = async (data: {
    bankAccountId: number;
    statementDate: string;
    file: File;
  }): Promise<BankStatement> => {
    try {
      let result: BankStatement;

      if ('uploadBankStatement' in CashFlowService) {
        result = await (CashFlowService as any).uploadBankStatement(data);
      } else {
        result = {
          id: Date.now(),
          bankAccountId: data.bankAccountId,
          statementDate: data.statementDate,
          periodStart: new Date(new Date(data.statementDate).getFullYear(), new Date(data.statementDate).getMonth(), 1).toISOString().split('T')[0],
          periodEnd: data.statementDate,
          openingBalance: 0,
          closingBalance: 0,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as BankStatement;
      }

      setBankStatements(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Error uploading statement:', error);
      throw error;
    }
  };

  const handleMatchEntry = async (lineId: number, journalEntryId: number): Promise<void> => {
    try {
      if ('matchStatementLine' in CashFlowService) {
        await (CashFlowService as any).matchStatementLine(lineId, journalEntryId);
      }

      setBankJournalEntries(prev => prev.map(je =>
        je.id === journalEntryId ? { ...je, reconciled: true } : je
      ));
    } catch (error) {
      console.error('Error matching entry:', error);
      throw error;
    }
  };

  const handleCompleteReconciliation = async (sessionId: number): Promise<void> => {
    try {
      if ('completeReconciliation' in CashFlowService) {
        await (CashFlowService as any).completeReconciliation(sessionId);
      }

      await loadBankReconciliationData();
    } catch (error) {
      console.error('Error completing reconciliation:', error);
      throw error;
    }
  };

  const handleRunwayRangeChange = async (range: TimeRange) => {
  const fullData = rawRunwayData.length > 0 ? rawRunwayData : runwayData;

  const cutoff = new Date();
  switch (range) {
    case '3m':  cutoff.setMonth(cutoff.getMonth() - 3); break;
    case '6m':  cutoff.setMonth(cutoff.getMonth() - 6); break;
    case '12m': cutoff.setFullYear(cutoff.getFullYear() - 1); break;
    default:    cutoff.setFullYear(2000); break;   
  }

  const sliced = fullData.filter(r => new Date(r.date) >= cutoff);
  setRunwayData(sliced);
};

  const transformForecastData = (data: ExtendedCashFlowForecast[]): CashFlowDataPoint[] => {
    if (!data || data.length === 0) return [];

    const byScenario = data.reduce((acc, f) => {
      (acc[f.scenario] = acc[f.scenario] || []).push(f);
      return acc;
    }, {} as Record<string, ExtendedCashFlowForecast[]>);

    const result: CashFlowDataPoint[] = [];

    Object.entries(byScenario).forEach(([_, forecasts]) => {
      forecasts.sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime());

      forecasts.forEach(forecast => {
        const start = new Date(forecast.periodStart);
        const end = new Date(forecast.periodEnd);
        const months = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));

        for (let i = 0; i < months; i++) {
          const date = new Date(start);
          date.setMonth(start.getMonth() + i);

          result.push({
            date, 
            projectedAmount: forecast.projectedAmount / months,
            burnRate: forecast.burnRate,
            runwayMonths: forecast.runwayMonths
          });
        }
      });
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  if (appLoading) {
    return (
      <group position={position}>
        <div>Loading application data...</div>
      </group>
    );
  }

  return (
    <group position={position} scale={1}>
      <Html transform center>
        <div className="cash-flow-dashboard">
          <div className="dashboard-header">
            <div className="tabs">
              <button
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={activeTab === 'burn' ? 'active' : ''}
                onClick={() => setActiveTab('burn')}
              >
                Burn Rate
              </button>
              <button
                className={activeTab === 'runway' ? 'active' : ''}
                onClick={() => setActiveTab('runway')}
              >
                Runway
              </button>
              <button
                className={activeTab === 'confidence' ? 'active' : ''}
                onClick={() => setActiveTab('confidence')}
              >
                Confidence
              </button>
              <button
                className={activeTab === 'scenarios' ? 'active' : ''}
                onClick={() => setActiveTab('scenarios')}
              >
                Scenarios
              </button>
              <button
                className={activeTab === 'risk' ? 'active' : ''}
                onClick={() => setActiveTab('risk')}
              >
                Risks
              </button>
              <button
                className={activeTab === 'liquidity' ? 'active' : ''}
                onClick={() => setActiveTab('liquidity')}
              >
                Liquidity
              </button>
              <button
                className={activeTab === 'bank-reconciliation' ? 'active' : ''}
                onClick={() => setActiveTab('bank-reconciliation')}
              >
                Bank Reconciliation
              </button>
            </div>
          </div>

          <div className="dashboard-content">
            {loading && activeTab !== 'bank-reconciliation' ? (
              <div className="loading-indicator">
                <div className="spinner" />
                <div>Loading {activeTab} data...</div>
              </div>
            ) : (
              <>
                <ReactFlowProvider>
                  {activeTab === 'overview' && (
                    <CashFlowOverview
                      scenarios={{
                        best_case: {
                          data: transformForecastData(forecasts.filter(f => f.scenario === 'BEST_CASE')),
                            assumptions: 'Optimistic market conditions'
                      },
                      base_case: {
                        data: transformForecastData(forecasts.filter(f => f.scenario === 'BASE_CASE')),
                          assumptions: 'Current market trajectory'
                      },
                      worst_case: {
                        data: transformForecastData(forecasts.filter(f => f.scenario === 'WORST_CASE')),
                          assumptions: 'Economic downturn conditions'
                      }
                      }}
                      currentCash={liquidityData.length > 0 ? liquidityData[liquidityData.length - 1].balance : 0}
                      onAddForecast={() => { }}
                      onScenarioChange={(scenario: string) => console.log('Scenario changed:', scenario)}
                      onTimeRangeChange={(range: TimeRange) => console.log('Time range changed:', range)}
                      confidence={currentConfidence}
                    />
                  )}

                  {activeTab === 'burn' && (
                    <CashFlowBurnRate
                      historicalData={liquidityData.map((l, i) => ({
                        date: new Date(l.date),
                        burnRate: l.cashOut / 30,
                        department: i % 3 === 0 ? 'Engineering' : i % 3 === 1 ? 'Marketing' : 'Operations',
                        category: i % 2 === 0 ? 'Fixed' : 'Variable'
                      }))}
                      forecastData={forecasts.map(f => ({
                        date: new Date(f.periodStart),
                        burnRate: (f.burnRate || 0) * (f.scenario === 'BEST_CASE' ? 0.9 : f.scenario === 'WORST_CASE' ? 1.1 : 1)
                      }))}
                      currentBurnRate={currentBurnRate}
                      onDrillDown={(dept: string | null) => console.log('Department selected:', dept)}
                      onTimeRangeChange={(range: TimeRange) => console.log('Time range changed:', range)}
                    />
                  )}

                  {activeTab === 'runway' && (
                    <CashFlowRunway
                      data={runwayData.map(item => ({
                        ...item,
                        date: new Date(item.date)
                      }))}
                      currentRunway={currentRunway}
                      onTimeRangeChange={handleRunwayRangeChange}
                      onAddFunding={() => console.log('Add funding clicked')}
                    />
                  )}

                  {activeTab === 'confidence' && (
                    <CashFlowConfidenceIntervals
                      data={confidenceData.map(item => ({
                        ...item,
                        date: new Date(item.date)
                      }))}
                      currentConfidence={currentConfidence}
                      onTimeRangeChange={(range: TimeRange) => console.log('Time range changed:', range)}
                      onFactorSelect={(factor: string | null) => console.log('Factor selected:', factor)}
                    />
                  )}

                  {activeTab === 'scenarios' && (
                    <CashFlowScenarioPlanner
                      initialScenarios={scenarios}
                    />
                  )}

                  {activeTab === 'risk' && (
                    <CashFlowRiskMatrix
                      risks={risks}
                      onRiskSelect={(risk: RiskFactor | null) => console.log('Risk selected:', risk)}
                      onMitigationUpdate={(riskId: string, mitigation: string) =>
                        console.log('Mitigation updated:', riskId, mitigation)}
                    />
                  )}

                  {activeTab === 'liquidity' && (
                    <CashFlowLiquidityEngine
                      data={liquidityData.map(item => ({
                        ...item,
                        date: new Date(item.date)
                      }))}
                      thresholds={{
                        warning: 100000,
                          critical: 50000
                      }}
                      onDateRangeChange={(range: TimeRange) => console.log('Date range changed:', range)}
                      onAccountSelect={(account: string | null) => console.log('Account selected:', account)}
                    />
                  )}

                  {activeTab === 'bank-reconciliation' && (
                    <Suspense fallback={
                      <div className="loading-indicator">
                        <div className="spinner" />
                        <div>Loading bank reconciliation...</div>
                      </div>
                      }>
                      <BankReconciliation
                        bankAccounts={bankAccounts}
                        statements={bankStatements}
                        journalEntries={bankJournalEntries}
                        loading={bankReconciliationLoading}
                        onUploadStatement={handleUploadStatement}
                        onMatchEntry={handleMatchEntry}
                        onCompleteReconciliation={handleCompleteReconciliation}
                        onRefresh={loadBankReconciliationData}
                      />
                    </Suspense>
                  )}
                </ReactFlowProvider>
              </>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}
