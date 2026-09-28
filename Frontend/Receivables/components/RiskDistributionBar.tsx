import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLegend,
  VictoryLabel
} from 'victory'
import { COLORS } from '../../colors'
import type { AccountsReceivable } from '../receivable'
import './RiskDistributionBar.scss'

interface RiskDistributionBarProps {
  receivables: AccountsReceivable[]
}

const RiskDistributionBar: React.FC<RiskDistributionBarProps> = ({ receivables }) => {
  const groups = [
    {
      label: 'Low Risk',
      filter: (r: AccountsReceivable) => (r.probabilityOfPayment ?? 0) > 0.7,
      color: COLORS.INCOME
    },
    {
      label: 'Medium Risk',
      filter: (r: AccountsReceivable) => (r.probabilityOfPayment ?? 0) > 0.4 && (r.probabilityOfPayment ?? 0) <= 0.7,
      color: COLORS.WARNING
    },
    {
      label: 'High Risk',
      filter: (r: AccountsReceivable) => (r.probabilityOfPayment ?? 0) <= 0.4,
      color: COLORS.EXPENSE
    }
  ]

  const data = groups.map(group => {
    const total = receivables
      .filter(group.filter)
      .reduce((sum, r) => {
        const amount = typeof r.amount === 'number' ? r.amount : parseFloat(r.amount as unknown as string) || 0
        return sum + amount
      }, 0)

    return {
      x: group.label,
      y: total,
      fill: group.color
    }
  })

  const validYValues = data.map(d => d.y).filter(y => typeof y === 'number' && !isNaN(y))
  const maxTotal = validYValues.length > 0 ? Math.max(...validYValues) : 1

  return (
    <div className="risk-distribution-wrapper">
      <h3 className="chart-title">Risk Exposure</h3>

      <div className="risk-bar-container">
        <VictoryChart
          width={400}
          height={300}
          domainPadding={{ x: 50, y: 20 }}
          padding={{ left: 80, right: 50, top: 60, bottom: 100 }}
        >
          <VictoryAxis
            label="Risk Level"
            style={{
              axis: { stroke: COLORS.TEXT },
              tickLabels: { fill: COLORS.TEXT, fontSize: 11 },
              axisLabel: { fill: COLORS.TEXT, fontSize: 12 }
            }}
          />

          <VictoryAxis
            dependentAxis
            label="Total Value"
            tickFormat={(y: number) => {
              if (isNaN(y) || typeof y !== 'number') return '$0k'
              return `$${(y / 1000).toFixed(0)}k`
            }}
            axisLabelComponent={<VictoryLabel dy={-20} dx={0} />}
            style={{
              axis: { stroke: COLORS.TEXT },
              tickLabels: { fill: COLORS.TEXT, fontSize: 11 },
              axisLabel: { fill: COLORS.TEXT, fontSize: 12 }
            }}
          />

          <VictoryBar
            data={data}
            style={{
              data: {
                fill: ({ datum }) => datum.fill,
                filter: 'drop-shadow(0 0 3px rgba(0, 245, 255, 0.5))'
              },
              labels: {
                fill: COLORS.TEXT,
                fontSize: 10,
                fontWeight: 'bold'
              }
            }}
            labels={({ datum }) => `$${(datum.y / 1000).toFixed(0)}k`}
            labelComponent={
              <VictoryLabel
                dy={-10}
                textAnchor="middle"
                style={{
                  fill: COLORS.TEXT,
                  fontSize: 10,
                  fontWeight: 'bold',
                  fontFamily: 'Orbitron'
                }}
              />
            }
            cornerRadius={4}
            barWidth={60}
          />

          <VictoryLegend
            x={100}
            y={260}
            orientation="horizontal"
            gutter={15}
            symbolSpacer={5}
            style={{
              labels: { fill: '#ffffff', fontSize: 10 },
              title: { fill: '#ffffff', fontSize: 10 }
            }}
            data={data.map(d => ({
              name: d.x,
              symbol: { fill: d.fill }
            }))}
          />
        </VictoryChart>
      </div>

      <p className="max-value-label">Max: $ {(maxTotal / 1000).toFixed(0)}k</p>
    </div>
  )
}

export default RiskDistributionBar
