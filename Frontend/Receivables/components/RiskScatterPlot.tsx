import { VictoryChart, VictoryScatter, VictoryAxis, VictoryTooltip, VictoryLabel } from 'victory'
import { COLORS } from '../../colors'
import type { AccountsReceivable } from '../receivable'
import './RiskScatterPlot.scss'

interface RiskScatterPlotProps {
  receivables: AccountsReceivable[]
}

const RiskScatterPlot: React.FC<RiskScatterPlotProps> = ({ receivables }) => {
  const data = receivables.map(r => {
    const probability = r.probabilityOfPayment || 0
    const daysLate = r.daysLate || 0
    const amount = r.amount

    let color = COLORS.EXPENSE
    if (probability > 0.7) color = COLORS.INCOME
    else if (probability > 0.4) color = COLORS.WARNING

    return {
      x: daysLate,
      y: probability,
      size: Math.max(3, Math.min(12, amount / 5000)),
      client: r.client.name,
      amount,
      daysLate,
      color
    }
  })

  return (
    <div className="risk-scatter-plot-wrapper">
      <h3 className="chart-title">Risk vs. Time</h3>

      <div className="risk-scatter-container">
        <VictoryChart
          width={400}
          height={300}
          domainPadding={{ x: 30, y: 20 }}
          padding={{ top: 30, bottom: 60, left: 70, right: 40 }}
        >
          <VictoryAxis
            dependentAxis
            label="Payment Probability"
            tickFormat={(t: any) => `${(t * 100).toFixed(0)}%`}
            axisLabelComponent={<VictoryLabel dy={-30} dx={0} />}
            style={{
              axis: { stroke: COLORS.TEXT },
              tickLabels: { fill: COLORS.TEXT, fontSize: 10 },
              axisLabel: { fill: COLORS.TEXT, fontSize: 12 }
            }}
          />
          <VictoryAxis
            label="Days Late"
            tickFormat={(t) => t.toString()}
            style={{
              axis: { stroke: COLORS.TEXT },
              tickLabels: { fill: COLORS.TEXT, fontSize: 10 },
              axisLabel: { fill: COLORS.TEXT, fontSize: 12 }
            }}
          />
          <VictoryScatter
            data={data}
            size={(datum) => datum.size}
            style={{
              data: {
                fill: ({ datum }) => datum.color,
                filter: 'drop-shadow(0 0 2px rgba(0, 245, 255, 0.4))'
              }
            }}
            labels={({ datum }) =>
              `${datum.client}: $${datum.amount.toLocaleString()} (${datum.daysLate}d)`
            }
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ fill: 'black' }}
                style={{ fill: COLORS.TEXT, fontSize: 9 }}
                dy={-12}
              />
            }
          />
        </VictoryChart>
      </div>

      <p className="chart-subtitle">Size = Amount | Color = Risk Level</p>
    </div>
  )
}

export default RiskScatterPlot
