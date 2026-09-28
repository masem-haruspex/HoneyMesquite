import { Html, Text } from '@react-three/drei';
import React, { useState, useEffect } from 'react';
import { COLORS } from '../../colors';
import type { CreateVendorInvoiceRequest, PaymentStatus } from '../vendor';
import { VendorService } from '../VendorService';

const VendorInvoiceForm = React.memo(({ 
  position,
  contractId,
  onSubmit,
  onCancel
}: {
  position: [number, number, number],
  contractId: number,
  onSubmit: (invoice: CreateVendorInvoiceRequest) => void,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<CreateVendorInvoiceRequest>({
    contractId,
    invoiceDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentStatus: 'PENDING',
    marketRateAtPayment: ''
  });
  const [errors, setErrors] = useState<Partial<CreateVendorInvoiceRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMarketRate, setCurrentMarketRate] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketRate = async () => {
      try {
        const mockRate = (150 + Math.random() * 50).toFixed(2);
        setCurrentMarketRate(mockRate);
        setFormData(prev => ({
          ...prev,
          marketRateAtPayment: mockRate
        }));
      } catch (error) {
        console.error("Failed to fetch market rate:", error);
      }
    };
    fetchMarketRate();
  }, [contractId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validate = () => {
    const newErrors: Partial<CreateVendorInvoiceRequest> = {};
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount must be a number';
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      onSubmit({
        ...formData,
        amount: VendorService.formatAmount(parseFloat(formData.amount))
      });
    }
  };

  const paymentStatusOptions: PaymentStatus[] = ['PENDING', 'PARTIAL', 'PAID', 'DISPUTED'];

  return (
    <group position={position}>
      <Html
        transform
        center
        distanceFactor={10}
        style={{ width: '420px' }}
      >
        <form className="invoice-form" onSubmit={handleSubmit}>
          <div className="glow-effect glow-effect--primary" />
          
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.5}
            color={COLORS.PRIMARY}
            anchorX="center"
            anchorY="middle"
            font="/fonts/orbitron-medium.otf"
          >
            INVOICE PROCESSING
          </Text>

          <div className="form-header">
            <div className="contract-id">
              Contract: <span className="id-value">#{contractId}</span>
            </div>
            {currentMarketRate && (
              <div className="market-rate">
                Current Market Rate: <span className="rate-value">${currentMarketRate}</span>
              </div>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Amount</span>
                <span className="label-required">*</span>
              </label>
              <div className="input-container">
                <div className="input-glow" />
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0.00"
                />
                <div className="currency-symbol">$</div>
              </div>
              {errors.amount && (
                <div className="error-message">{errors.amount}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Date</span>
                <span className="label-required">*</span>
              </label>
              <div className="input-container">
                <div className="input-glow" />
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              {errors.invoiceDate && (
                <div className="error-message">{errors.invoiceDate}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Status</span>
              </label>
              <div className="select-container">
                <div className="select-glow" />
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="form-select"
                >
                  {paymentStatusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Market Rate</span>
              </label>
              <div className="input-container">
                <div className="input-glow" />
                <input
                  type="text"
                  name="marketRateAtPayment"
                  value={formData.marketRateAtPayment!}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Current market rate"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="submit-spinner" />
                  Processing...
                </>
              ) : (
                'Record Invoice'
              )}
            </button>
          </div>

          <div className="form-footer">
            <div className="hint-text">
              <span className="hint-icon">⚡</span>
              All transactions are logged to the blockchain ledger
            </div>
          </div>
        </form>
      </Html>
    </group>
  );
});

export default VendorInvoiceForm;
