// Receivables.tsx
import { Html, Text } from '@react-three/drei';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import React, { useEffect, Suspense } from 'react';
import "./Receivables.scss";
import { COLORS } from '../colors';
import { receivablesDataAtom } from '../atoms/dataAtoms';
import type { AccountsReceivable } from './receivable';
import { ReceivableService } from './ReceivableService';

const receivablesAtom = atomWithStorage<AccountsReceivable[]>('receivables/data', []);
const loadingAtom = atomWithStorage<boolean>('receivables/loading', false);
const activeViewAtom = atomWithStorage<'connections' | 'timeline' | 'risk' | 'aging'>('receivables/view', 'connections');
const selectedReceivableAtom = atomWithStorage<AccountsReceivable | null>('receivables/selected', null);

const ReceivableConnections = React.lazy(() => import('./components/ReceivableConnections'));
const RiskScatterPlot = React.lazy(() => import('./components/RiskScatterPlot'));
const RiskDistributionBar = React.lazy(() => import('./components/RiskDistributionBar'));
const ReceivablesAgingChart = React.lazy(() => import('./components/AgingChart'));
const ReceivableDetail = React.lazy(() => import('./components/ReceivableDetail'));
const TimelineChart2D = React.lazy(() => import('./components/TimelineChart2D'));

export default function Receivables({ position }: { position: [number, number, number] }) {
  position[1] -= 0.25;

  const [globalReceivablesData] = useAtom(receivablesDataAtom);
  const [appLoading] = useAtom(loadingAtom);

  const [receivables, setReceivables] = useAtom(receivablesAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [selectedReceivable, setSelectedReceivable] = useAtom(selectedReceivableAtom);

  const safeReceivables = Array.isArray(receivables) ? receivables : [];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (globalReceivablesData.length) {
          setReceivables(globalReceivablesData);
        } else {
          const data = await ReceivableService.getReceivables();
          setReceivables(data);
        }
      } catch (e) {
        console.error(e);
        setReceivables([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [globalReceivablesData, setReceivables, setLoading]);

  if (appLoading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          Loading application data…
        </Text>
      </group>
    );
  }

  if (loading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          Loading…
        </Text>
      </group>
    );
  }

    return (
      <Html
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
        position={[0, 0, 0]}
        className="receivables-main-wrapper"
        transform
      >
        <div className="receivables-dashboard">
          <div className="dashboard-header">
            <div className="tabs">
              {(['connections', 'timeline', 'risk', 'aging'] as const).map((v) => (
                <button
                  key={v}
                  className={`tab-button ${activeView === v ? 'active' : ''}`}
                  onClick={() => setActiveView(v)}
                >
                  {v === 'connections' ? 'Connections' : v === 'timeline' ? 'Payment Timeline' : v === 'risk' ? 'Risk' : 'Aging'}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container">
            {activeView === 'connections' && (
              <Suspense fallback={<div style={{ color: 'white' }}>Loading connections chart...</div>}>
                <ReceivableConnections receivables={safeReceivables} />
              </Suspense>
            )}

            {activeView === 'risk' && (
              <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', color: 'white', paddingTop: 60 }}>
                <Suspense fallback={<div>Loading risk charts...</div>}>
                  <RiskScatterPlot receivables={safeReceivables} />
                </Suspense>
                <Suspense fallback={<div>Loading risk distribution...</div>}>
                  <RiskDistributionBar receivables={safeReceivables} />
                </Suspense>
              </div>
            )}

            {activeView === 'aging' && (
              <Suspense fallback={<div>Loading aging chart...</div>}>
                <ReceivablesAgingChart receivables={safeReceivables} />
              </Suspense>
            )}

            {activeView === 'timeline' && (
              <Suspense fallback={<div>Loading timeline chart...</div>}>
                <TimelineChart2D receivables={safeReceivables} />
              </Suspense>
            )}
          </div>
        </div>

        {selectedReceivable && (
          <Suspense fallback={null}>
            <ReceivableDetail
              receivable={selectedReceivable}
              onClose={() => setSelectedReceivable(null)}
            />
          </Suspense>
        )}
      </Html>
  );
}
