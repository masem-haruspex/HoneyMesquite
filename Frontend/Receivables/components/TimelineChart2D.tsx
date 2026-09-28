// components/TimelineChart2D.tsx
import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryScatter,
  VictoryTooltip,
} from 'victory';
import { COLORS } from '../../colors';
import type { AccountsReceivable } from '../receivable';

interface TimelineChart2DProps {
  receivables: AccountsReceivable[];
}

export default function TimelineChart2D({ receivables }: TimelineChart2DProps) {
  const data = receivables.map((r) => ({
    x: r.daysLate ?? 0,
    y: r.probabilityOfPayment ?? 0,
    size: Math.max(4, Math.min(20, (r.amount / 5000) * 1)),
    fill: r.probabilityOfPayment !== null && r.probabilityOfPayment !== undefined
  ? r.probabilityOfPayment >= 90
    ? COLORS.INCOME
    : r.probabilityOfPayment >= 70
      ? COLORS.WARNING
      : COLORS.ERROR
  : COLORS.ERROR,
    label: `${r.invoiceNumber}\n$${r.amount.toLocaleString()}\n${r.client.name}`,
  }));
  console.log("Data:", data);

  return (
    <div className="timeline-chart-2d" style={{paddingTop: 24, overflow: "hidden"}}>
      <VictoryChart
        width={800}
        height={500}
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
          style={{ data: { fill: ({ datum }) => datum.fill } }}
          labelComponent={
            <VictoryTooltip
              style={{ fontSize: 10, fill: COLORS.TEXT }}
              flyoutStyle={{
                fill: '#000',
                stroke: COLORS.PRIMARY,
                strokeWidth: 1,
                opacity: 0.9,
              }}
            />
          }
        />
        <VictoryLegend
          x={600}
          y={20}
          orientation="horizontal"
          gutter={20}
          style={{ labels: { fill: COLORS.MUTED, fontSize: 10 } }}
          data={[
            { name: 'High ≥90%', symbol: { fill: COLORS.INCOME } },
            { name: 'Med 70–89%', symbol: { fill: COLORS.WARNING } },
            { name: 'Low <70%', symbol: { fill: COLORS.ERROR } },
          ]}
        />
      </VictoryChart>
    </div>
  );
}
