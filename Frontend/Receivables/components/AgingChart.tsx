// components/ReceivablesAgingChart.tsx
import { useState } from 'react'
import { COLORS } from '../../colors'
import type { AccountsReceivable } from '../receivable'
import ReceivableDetail from './ReceivableDetail'
import './AgingChart.scss'

type AgingBucketKey = '0-30' | '31-60' | '61-90' | '90+'

interface ReceivablesAgingChartProps {
  receivables: AccountsReceivable[]
}

export default function ReceivablesAgingChart({ receivables }: ReceivablesAgingChartProps) {
  const [hoveredBucket, setHoveredBucket] = useState<AgingBucketKey | null>(null)
  const [selectedReceivable, setSelectedReceivable] = useState<AccountsReceivable | null>(null)

  const agingBuckets: Record<AgingBucketKey, AccountsReceivable[]> = {
    '0-30': receivables.filter(r => (r.daysLate || 0) <= 30),
    '31-60': receivables.filter(r => (r.daysLate || 0) > 30 && (r.daysLate || 0) <= 60),
    '61-90': receivables.filter(r => (r.daysLate || 0) > 60 && (r.daysLate || 0) <= 90),
    '90+': receivables.filter(r => (r.daysLate || 0) > 90)
  }

  const bucketTotals = Object.entries(agingBuckets).reduce((acc, [range, items]) => {
    acc[range as AgingBucketKey] = items.reduce((sum, r) => sum + r.amount, 0)
    return acc
  }, {} as Record<AgingBucketKey, number>)

  const totalOutstanding = receivables.reduce((sum, r) => sum + r.amount, 0)

  const getBucketColor = (range: AgingBucketKey): string => {
    switch (range) {
      case '0-30': return COLORS.INCOME
      case '31-60': return COLORS.WARNING
      case '61-90': return COLORS.EXPENSE
      case '90+': return COLORS.CRITICAL
      default: return COLORS.PRIMARY
    }
  }

  const handleBucketClick = (bucket: AgingBucketKey) => {
    const bucketItems = agingBuckets[bucket]
    setSelectedReceivable(bucketItems[0] || null)
  }

  const handleBucketHover = (bucket: AgingBucketKey) => {
    setHoveredBucket(bucket)
  }

  const handleMouseLeave = () => {
    setHoveredBucket(null)
    setSelectedReceivable(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <group>
        <div className="aging-chart-container">
          <div className="chart-header">
            <div className="total-outstanding">
              <span className="label">Total Outstanding:</span>
              <span className="value">{formatCurrency(totalOutstanding)}</span>
            </div>
            <div className="status-summary">
              <div className="status-item">
                <span className="label">Current:</span>
                <span className="value">{agingBuckets['0-30'].length}</span>
              </div>
              <div className="status-item">
                <span className="label">Overdue:</span>
                <span className="value">
                  {agingBuckets['31-60'].length + agingBuckets['61-90'].length + agingBuckets['90+'].length}
                </span>
              </div>
              <div className="status-item">
                <span className="label">High Risk:</span>
                <span className="value">{agingBuckets['90+'].length}</span>
              </div>
            </div>
          </div>

          <div className="bar-chart">
            {(Object.entries(agingBuckets) as [AgingBucketKey, AccountsReceivable[]][]).map(([range, items]) => {
              const percentage = totalOutstanding > 0 ? (bucketTotals[range] / totalOutstanding) * 100 : 0
              const isCritical = range === '90+'

              return (
                <div
                  key={range}
                  className={`bar-item ${isCritical ? 'critical' : ''}`}
                  onMouseEnter={() => handleBucketHover(range)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleBucketClick(range)}
                >
                  <div
                    className="bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getBucketColor(range),
                      opacity: hoveredBucket === range ? 0.8 : 0.6
                    }}
                  />
                  <div className="bar-labels">
                    <span className="range">{range} Days</span>
                    <span className="count">{items.length} invoices</span>
                    <span className="amount">{formatCurrency(bucketTotals[range])}</span>
                    <span className="percentage">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="legend">
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

      {selectedReceivable && (
        <ReceivableDetail
          receivable={selectedReceivable}
          onClose={() => setSelectedReceivable(null)}
        />
      )}
    </group>
  )
}
