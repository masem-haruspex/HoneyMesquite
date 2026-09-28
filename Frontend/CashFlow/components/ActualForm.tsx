// ActualForm.tsx
import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { COLORS } from '../../colors';
import type { ForecastActual } from '../cashFlow';
import '../CashFlow.scss';

interface ActualFormProps {
  position?: [number, number, number];
  onSubmit: (actual: Omit<ForecastActual, 'id'>) => void;
  forecastId: number;
  onCancel?: () => void;
  initialValues?: Partial<ForecastActual>;
}

const ActualForm: React.FC<ActualFormProps> = ({ 
  position = [0, 0, 0],
  onSubmit,
  forecastId,
  onCancel,
  initialValues
}) => {
  const [formData, setFormData] = useState<Omit<ForecastActual, 'id'>>({
    forecastId,
    actualDate: initialValues?.actualDate || new Date().toISOString().split('T')[0],
    actualAmount: initialValues?.actualAmount || 0,
    variance: initialValues?.variance,
    variancePercentage: initialValues?.variancePercentage,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === 'actualAmount' || name === 'variance' || name === 'variancePercentage' 
        ? Number(value) 
        : value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.actualDate) {
      newErrors.actualDate = 'Date is required';
    }
    
    if (isNaN(formData.actualAmount)) {
      newErrors.actualAmount = 'Amount must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Html
      position={position}
      center
      distanceFactor={10}
      style={{ width: '400px' }}
    >
      <form onSubmit={handleSubmit} className="cashflow-form__container">
        <div className="glow-effect glow-effect--primary" />
        
        <h2 className="cashflow-form__title">
          Record Actual Cash Flow
        </h2>

        <div className="cashflow-form__input-group">
          <label className="cashflow-form__label">Date</label>
          <input
            type="date"
            name="actualDate"
            value={formData.actualDate}
            onChange={handleChange}
            className="cashflow-form__input"
          />
          {errors.actualDate && <div className="cashflow-form__error">{errors.actualDate}</div>}
        </div>

        <div className="cashflow-form__input-group">
          <label className="cashflow-form__label">Actual Amount ($)</label>
          <input
            type="number"
            name="actualAmount"
            value={formData.actualAmount}
            onChange={handleChange}
            className="cashflow-form__input"
            step="0.01"
          />
          {errors.actualAmount && <div className="cashflow-form__error">{errors.actualAmount}</div>}
        </div>

        <div className="cashflow-form__input-group">
          <label className="cashflow-form__label">Variance ($)</label>
          <input
            type="number"
            name="variance"
            value={formData.variance || ''}
            onChange={handleChange}
            className="cashflow-form__input"
            step="0.01"
          />
        </div>

        <div className="cashflow-form__input-group">
          <label className="cashflow-form__label">Variance (%)</label>
          <input
            type="number"
            name="variancePercentage"
            value={formData.variancePercentage || ''}
            onChange={handleChange}
            className="cashflow-form__input"
            step="0.01"
          />
        </div>

        <div className="cashflow-form__buttons">
          <button
            type="submit"
            className="cashflow-form__button"
            style={{ backgroundColor: COLORS.PRIMARY }}
          >
            {initialValues?.forecastId ? 'Update Actual' : 'Record Actual'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              className="cashflow-form__button"
              onClick={onCancel}
              style={{ backgroundColor: COLORS.EXPENSE, marginLeft: '10px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </Html>
  );
};

export default ActualForm;
