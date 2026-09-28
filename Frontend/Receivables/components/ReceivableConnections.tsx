// components/ReceivableConnections.tsx
import {
  VictoryChart,
  VictoryScatter,
  VictoryLine,
  VictoryAxis,
  VictoryLabel,
} from 'victory'
import { COLORS } from '../../colors'
import type { AccountsReceivable } from '../receivable'
import "./ReceivableConnections.scss";

interface Point {
  x: number
  y: number
  amount: number
  clientName: string
  status: string
  probability: number
  color: string
  id: number
}

interface Connection {
  start: { x: number; y: number }
  end: { x: number; y: number }
  color: string
}

interface ReceivableConnectionsProps {
  receivables: AccountsReceivable[]
}

export default function ReceivableConnections({ receivables }: ReceivableConnectionsProps) {
  const points: Point[] = receivables.map((r) => ({
    x: r.id,
    y: r.daysLate || 0,
    amount: r.amount,
    clientName: r.client.name,
    status: r.collectionStage,
    probability: r.probabilityOfPayment || 0,
    color: getAgingColor(r),
    id: r.id
  }))

  const connections: Connection[] = []
  const clientMap = new Map<number, AccountsReceivable[]>()
  receivables.forEach((r) => {
    if (!clientMap.has(r.client.id)) {
      clientMap.set(r.client.id, [])
    }
    clientMap.get(r.client.id)?.push(r)
  })

  clientMap.forEach((clientReceivables) => {
    if (clientReceivables.length > 1) {
      for (let i = 0; i < clientReceivables.length - 1; i++) {
        const r1 = clientReceivables[i]
        const r2 = clientReceivables[i + 1]
        const p1 = points.find((p) => p.id === r1.id)
        const p2 = points.find((p) => p.id === r2.id)
        if (p1 && p2) {
          connections.push({
            start: { x: p1.x, y: p1.y },
            end: { x: p2.x, y: p2.y },
            color: COLORS.PRIMARY
          })
        }
      }
    }
  })

  return (
    <div className="receivable-chart-container">
      <VictoryChart
        domainPadding={{ x: 0, y: 0 }}
        width={800}
        height={500}
        padding={{ top: 50, bottom: 70, left: 70, right: 40 }}
      >
        <VictoryAxis
  dependentAxis
          tickFormat={(t: number) => `${t} days`}
  label="Days Late"
  axisLabelComponent={<VictoryLabel dx={-10} dy={-32} />}
  style={{
    axis: { stroke: '#ffffff', strokeWidth: 1 },
    tickLabels: { fill: '#ffffff', fontSize: 10 },
    axisLabel: {
      fill: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold'
    }
  }}
/>

        <VictoryAxis
          tickFormat={(t) => t.toString()}
          label="Invoice ID"
          style={{
            axis: { stroke: '#ffffff', strokeWidth: 1 },
              tickLabels: { fill: '#ffffff', fontSize: 10 },
              axisLabel: { fill: '#ffffff', fontSize: 12 }
          }}
        />

        <VictoryScatter
  data={points}
  size={8}
  style={{
    data: {
      fill: ({ datum }) => datum.color,
      stroke: ({ datum }) => datum.color,
      strokeWidth: 1
    }
  }}
  labels={({ datum }) => datum.clientName}
  labelComponent={
    <VictoryLabel
      dy={16} 
      style={{
        fill: '#fff',
        fontSize: 9,
        fontWeight: 'normal'
      }}
    />
  }
/>

        {connections.map((conn, i) => (
          <VictoryLine
  key={i}
  data={[
    { x: conn.start.x, y: conn.start.y },
    { x: conn.end.x, y: conn.end.y }
  ]}
  style={{
    data: {
      stroke: conn.color,
      strokeWidth: 2,
      opacity: 0.6
    }
  }}
/>
        ))}
      </VictoryChart>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: COLORS.INCOME }}></div>
          <span>0–30 days</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: COLORS.WARNING }}></div>
          <span>31–60 days</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: COLORS.EXPENSE }}></div>
          <span>61–90 days</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{ backgroundColor: COLORS.CRITICAL }}></div>
          <span>90+ days</span>
        </div>
      </div>
    </div>
  )
}

function getAgingColor(receivable: AccountsReceivable): string {
  const daysLate = receivable.daysLate || 0
  if (daysLate <= 30) return COLORS.INCOME
  if (daysLate <= 60) return COLORS.WARNING
  if (daysLate <= 90) return COLORS.EXPENSE
  return COLORS.CRITICAL
}
