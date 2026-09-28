// components/TimelineChart3D.tsx
import { Html } from '@react-three/drei';
import { useMemo } from 'react';
import {
  VictoryAxis,
  VictoryChart,
  VictoryContainer,
  VictoryLegend,
  VictoryScatter,
  VictoryTooltip,
} from 'victory';
import { COLORS } from '../../colors';
import type { AccountsReceivable } from '../receivable';

interface TimelineChart3DProps {
  receivables: AccountsReceivable[];
}

export default function TimelineChart3D({ receivables }: TimelineChart3DProps) {
  const data = useMemo(() => {
    const minAmt = Math.min(...receivables.map((r) => r.amount));
    const maxAmt = Math.max(...receivables.map((r) => r.amount));
    const radius = (a: number) => 4 + ((a - minAmt) / (maxAmt - minAmt)) * 16;

    const riskColor = (p: number | null | undefined) => {
      const prob = p ?? 0;
      if (prob >= 90) return COLORS.INCOME;
      if (prob >= 70) return COLORS.WARNING;
      return COLORS.ERROR;
    };

    return receivables.map((r) => ({
      x: r.daysLate ?? 0,
      y: r.probabilityOfPayment ?? 0,
      size: radius(r.amount),
      fill: riskColor(r.probabilityOfPayment),
      label: `${r.invoiceNumber}\n$${r.amount.toLocaleString()}\n${r.client.name}`,
    }));
  }, [receivables]);

  return (
    <group position={[0, 0, -2]}
      <Html
        transform
        distanceFactor={8}
        style={{
          width: '900px',
          height: '600px',
          pointerEvents: 'auto',
          background: 'transparent'
        }}
        className="timeline-chart-html"
      >
        <div style={{
          width: '100%',
          height: '100%',
          background: COLORS.CARD_BG,
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${COLORS.PRIMARY}`
        }}>
          <VictoryChart
            width={880}
            height={580}
            padding={{ top: 40, bottom: 60, left: 70, right: 40 }}
            containerComponent={<VictoryContainer responsive={false} />}
          >
            <VictoryAxis
              dependentAxis
              label="Probability of Payment (%)"
              style={{
                axisLabel: { fill: COLORS.PRIMARY, fontSize: 12 },
                tickLabels: { fill: COLORS.MUTED, fontSize: 10 },
                grid: { stroke: COLORS.DARK_MUTED, strokeDasharray: '3,3' },
              }}
            />
            <VictoryAxis
              label="Days Late"
              style={{
                axisLabel: { fill: COLORS.PRIMARY, fontSize: 12 },
                tickLabels: { fill: COLORS.MUTED, fontSize: 10 },
                grid: { stroke: COLORS.DARK_MUTED, strokeDasharray: '3,3' },
              }}
            />
            <VictoryScatter
              data={data}
              size={(d) => d.size}
              style={{ data: { fill: ({ datum }: any) => datum.fill } }}
              labelComponent={
                <VictoryTooltip
                  style={{ fontSize: 10, fill: COLORS.TEXT }}
                  flyoutStyle={{
                    fill: COLORS.CARD_BG,
                    stroke: COLORS.PRIMARY,
                    strokeWidth: 1
                  }}
                />
              }
            />
            <VictoryLegend
              x={700}
              y={20}
              orientation="horizontal"
              gutter={20}
              style={{ labels: { fill: COLORS.MUTED, fontSize: 10 } }}
              data={[
                { name: 'High ≥90%', symbol: { fill: COLORS.INCOME } },
                { name: 'Med 70-89%', symbol: { fill: COLORS.WARNING } },
                { name: 'Low <70%', symbol: { fill: COLORS.ERROR } },
              ]}
            />
          </VictoryChart>
        </div>
      </Html>
    </group>
  );
}
