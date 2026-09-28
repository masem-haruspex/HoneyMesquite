import { useState } from 'react'
import { COLORS } from '../../colors'
import type { AccountsReceivable } from '../receivable'
import '../../scss/glow.scss'
import "./ReceivableDetail.scss";

interface ReceivableDetailProps {
  receivable: AccountsReceivable
  onClose: () => void
}

export default function ReceivableDetail({ receivable, onClose }: ReceivableDetailProps) {
  const [hovered, setHovered] = useState(false)
  const paymentProbability = receivable.probabilityOfPayment || 0

  const statusColor = getStatusColor(receivable)

  return (
    <div className="receivable-detail-wrapper">
      <div className="receivable-detail-container">
        <div className="detail-header">
          <h2>{receivable.client.name}</h2>
          <div className="invoice-number">{receivable.invoiceNumber}</div>
        </div>

        <div className="detail-content">
          <div className="detail-row">
            <span className="label">Amount:</span>
            <span className="value">${receivable.amount.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Issued:</span>
            <span className="value">{new Date(receivable.issuedDate).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Due:</span>
            <span className="value">{new Date(receivable.dueDate || '').toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Days Late:</span>
            <span className="value" style={{ color: statusColor }}>
              {receivable.daysLate || 0}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className="value" style={{ color: statusColor }}>
              {receivable.collectionStage.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="probability-meter">
          <div className="meter-label">Payment Probability</div>
          <div className="meter-bar">
            <div
              className="meter-fill"
              style={{
                width: `${paymentProbability * 100}%`,
                background: `linear-gradient(90deg, ${COLORS.INCOME}, ${statusColor})`
              }}
            />
            <div className="meter-value">{Math.round(paymentProbability * 100)}%</div>
          </div>
        </div>

        <button
          className={`detail-close-btn ${hovered ? 'hover' : ''}`}
          onClick={onClose}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          Close
        </button>
      </div>
    </div>
  )
}

function getStatusColor(receivable: AccountsReceivable): string {
  const daysLate = receivable.daysLate || 0
  if (daysLate <= 30) return COLORS.INCOME
  if (daysLate <= 60) return COLORS.WARNING
  return COLORS.EXPENSE
}
