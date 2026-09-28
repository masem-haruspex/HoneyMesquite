// CashFlowForm.tsx
import React, { useState } from 'react';
import { COLORS } from '../../colors';
import type { CashFlowForecast } from '../cashFlow';
import '../CashFlow.scss';

interface CashFlowFormProps {
  position?: [number, number, number]; 
  onSubmit: (forecast: Omit<CashFlowForecast, 'id'>) => void;
  initialValues?: Partial<CashFlowForecast>;
  onCancel?: () => void;
}

const CashFlowForm: React.FC<CashFlowFormProps> = ({
  onSubmit,
  initialValues,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<CashFlowForecast, 'id'>>({
    scenario: initialValues?.scenario || 'BASE_CASE',
    forecastDate: initialValues?.forecastDate || new Date().toISOString().split('T')[0],
    periodStart: initialValues?.periodStart || '',
    periodEnd: initialValues?.periodEnd || '',
    projectedAmount: initialValues?.projectedAmount || 0,
    confidenceInterval: initialValues?.confidenceInterval,
    burnRate: initialValues?.burnRate,
    assumptions: initialValues?.assumptions || {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'projectedAmount' || name === 'confidenceInterval' || name === 'burnRate') {
      setFormData({
        ...formData,
        [name]: value ? Number(value) : undefined
      });
    } else if (name === 'assumptions') {
      try {
        const parsed = value ? JSON.parse(value) : {};
        setFormData({
          ...formData,
          assumptions: parsed
        });
      } catch (err) {
        console.warn('Invalid JSON in assumptions');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.scenario) {
      newErrors.scenario = 'Scenario is required';
    }

    if (!formData.periodStart) {
      newErrors.periodStart = 'Start date is required';
    }

    if (!formData.periodEnd) {
      newErrors.periodEnd = 'End date is required';
    }

    if (formData.periodStart && formData.periodEnd && new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      newErrors.periodEnd = 'End date must be after start date';
    }

    if (isNaN(formData.projectedAmount)) {
      newErrors.projectedAmount = 'Amount must be a number';
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
    <form onSubmit={handleSubmit} className="cashflow-form__container">
      <div className="glow-effect glow-effect--primary" />

      <h2 className="cashflow-form__title">
        {initialValues?.id ? 'Edit Forecast' : 'Create Forecast'}
      </h2>

      <div className="cashflow-form__input-group">
        <label className="cashflow-form__label">Scenario</label>
        <select
          name="scenario"
          value={formData.scenario}
          onChange={handleChange}
          className="cashflow-form__input"
        >
          <option value="BEST_CASE">Best Case</option>
          <option value="BASE_CASE">Base Case</option>
          <option value="WORST_CASE">Worst Case</option>
        </select>
        {errors.scenario && <div className="cashflow-form__error">{errors.scenario}</div>}
      </div>

      <div className="cashflow-form__input-group">
        <label className="cashflow-form__label">Projected Amount ($)</label>
        <input
          type="number"
          name="projectedAmount"
          value={formData.projectedAmount}
          onChange={handleChange}
          className="cashflow-form__input"
          step="0.01"
        />
        {errors.projectedAmount && <div className="cashflow-form__error">{errors.projectedAmount}</div>}
      </div>

      <div className="cashflow-form__input-group">
        <label className="cashflow-form__label">Period Start</label>
        <input
          type="date"
          name="periodStart"
          value={formData.periodStart}
          onChange={handleChange}
          className="cashflow-form__input"
        />
        {errors.periodStart && <div className="cashflow-form__error">{errors.periodStart}</div>}
      </div>

      <div className="cashflow-form__input-group">
        <label className="cashflow-form__label">Period End</label>
        <input
          type="date"
          name="periodEnd"
          value={formData.periodEnd}
          onChange={handleChange}
          className="cashflow-form__input"
        />
        {errors.periodEnd && <div className="cashflow-form__error">{errors.periodEnd}</div>}
      </div>

      <div className="cashflow-form__input-group">
        <label className="cashflow-form__label">Confidence Interval (%)</label>
        <input
          type="number"
          name="confidenceInterval"
          value={formData.confidenceInterval || ''}
          onChange={handleChange}
          className="cashflow-form__input"
          min="0"
          max="100"
          step="1"
        />
      </div>

      <div className="cashflow-form__input-group">
        <label className="cashflow-form__label">Daily Burn Rate ($)</label>
        <input
          type="number"
          name="burnRate"
          value={formData.burnRate || ''}
          onChange={handleChange}
          className="cashflow-form__input"
          min="0"
          step="0.01"
        />
      </div>

      <div className="cashflow-form__input-group">
        <label className="cashflow-form__label">Assumptions (JSON)</label>
        <textarea
          name="assumptions"
          value={JSON.stringify(formData.assumptions, null, 2)}
          onChange={handleChange}
          className="cashflow-form__input"
          rows={4}
        />
      </div>

      <div className="cashflow-form__buttons">
        <button
          type="submit"
          className="cashflow-form__button"
          style={{ backgroundColor: COLORS.PRIMARY }}
        >
          {initialValues?.id ? 'Update Forecast' : 'Create Forecast'}
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
  );
};

export default CashFlowForm;
