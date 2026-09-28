import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import type { 
  BudgetAllocationRequest, 
    BudgetActualRequest,
    Category
} from '../budget';
import '../Budget.scss';
import { ThreeDSelect } from '../../common_components/ThreeDSelect';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export interface BudgetFormState {
  type: 'allocation' | 'actual';
  allocationId?: number;
  categoryId?: number;
  departmentId?: number;
  fiscalYear?: number;
  quarter?: typeof QUARTERS[number];
  amount?: number;
  recordedDate?: string;
  notes?: string;
}

interface BudgetFormProps {
  initialState: BudgetFormState;
  onSave: (data: BudgetAllocationRequest | BudgetActualRequest) => void;
  onCancel: () => void;
  categories: Category[];
}

const BudgetForm = React.memo(({ 
  initialState,
  onSave,
  onCancel,
  categories
}: BudgetFormProps) => {
  const [formData, setFormData] = useState<BudgetFormState>(initialState);
  console.log(categories);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === 'allocation') {
      const allocationData: BudgetAllocationRequest = {
        departmentId: formData.departmentId!,
        categoryId: formData.categoryId!,
        fiscalYear: formData.fiscalYear!,
        quarter: formData.quarter!,
        budgetedAmount: formData.amount!,
        isCurrent: true
      };
      onSave(allocationData);
    } else {
      const actualData: BudgetActualRequest = {
        allocationId: formData.allocationId!,
        recordedDate: formData.recordedDate || new Date().toISOString().split('T')[0],
        actualAmount: formData.amount!,
        notes: formData.notes
      };
      onSave(actualData);
    }
  };

  return (
    <Html
      center
      distanceFactor={10}
      position={[0, 0, 10]}
      style={{ width: '400px' }}
    >
      <form onSubmit={handleSubmit} className="budget-form">
        <h3 className="budget-form__title">
          {formData.type === 'allocation' ? 'Add Budget Allocation' : 'Record Actual Spending'}
        </h3>

        {formData.type === 'allocation' ? (
          <>
            <div className="budget-form__group">
              <label>Category</label>
              <ThreeDSelect
                options={[
                  { value: '', label: 'Select Category' },
                ...categories.map(category => ({ value: category.id, label: category.name }))
                ]}
                value={formData.categoryId || ''}
                onChange={(value) => setFormData({...formData, categoryId: Number(value)})}
                />
              </div>
            <div className="budget-form__group">
              <label>Department ID</label>
              <input
                type="number"
                value={formData.departmentId || ''}
                onChange={(e) => setFormData({...formData, departmentId: Number(e.target.value)})}
                required
              />
            </div>

            <div className="budget-form__group">
              <label>Fiscal Year</label>
              <input
                type="number"
                value={formData.fiscalYear || ''}
                onChange={(e) => setFormData({...formData, fiscalYear: Number(e.target.value)})}
                required
              />
            </div>


            <div className="budget-form__group">
              <label>Quarter</label>
              <ThreeDSelect
                options={[
                  { value: '', label: 'Select Quarter' },
                ...QUARTERS.map(q => ({ value: q, label: q }))
                ]}
                value={formData.quarter || ''}
                onChange={(value) => setFormData({...formData, quarter: value as typeof QUARTERS[number]})}
                />
              </div>
            </>
        ) : (
          <>
            <div className="budget-form__group">
              <label>Allocation ID</label>
              <input
                type="number"
                value={formData.allocationId || ''}
                onChange={(e) => setFormData({...formData, allocationId: Number(e.target.value)})}
                required
              />
            </div>

            <div className="budget-form__group">
              <label>Date</label>
              <input
                type="date"
                value={formData.recordedDate || ''}
                onChange={(e) => setFormData({...formData, recordedDate: e.target.value})}
              />
            </div>
          </>
        )}

        <div className="budget-form__group">
          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
            required
          />
        </div>

        {formData.type === 'actual' && (
          <div className="budget-form__group">
            <label>Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        )}

        <div className="budget-form__buttons">
          <button type="button" onClick={onCancel} className="budget-form__cancel">
            Cancel
          </button>
          <button type="submit" className="budget-form__submit">
            Save
          </button>
        </div>
            </form>
          </Html>
  );
});

export default BudgetForm;
