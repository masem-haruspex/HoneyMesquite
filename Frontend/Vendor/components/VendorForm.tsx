import { Html } from '@react-three/drei';
import React, { useState } from 'react';
import type { CreateVendorRequest } from '../vendor';

const VendorForm = React.memo(({ 
  position,
  onSubmit,
  onCancel
}: {
  position: [number, number, number],
  onSubmit: (vendor: CreateVendorRequest) => void,
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState<CreateVendorRequest>({
    legalName: '',
    industryClassification: '',
    marketRateReference: ''
  });
  const [errors, setErrors] = useState<Partial<CreateVendorRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const newErrors: Partial<CreateVendorRequest> = {};
    if (!formData.legalName.trim()) {
      newErrors.legalName = 'Legal name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      onSubmit(formData);
    }
  };

  return (
    <group position={position}>
      <Html
        transform
        center
        distanceFactor={10}
        style={{ width: '400px' }}
      >
        <form className="vendor-form" onSubmit={handleSubmit}>
          <div className="glow-effect glow-effect--primary" />
          
          <div>NEW VENDOR ENTRY</div>
            

          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Legal Name</span>
              <span className="label-required">*</span>
            </label>
            <div className="input-container">
              <div className="input-glow" />
              <input
                type="text"
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter legal entity name"
                autoFocus
              />
            </div>
            {errors.legalName && (
              <div className="error-message">{errors.legalName}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Industry Classification</span>
            </label>
            <div className="input-container">
              <div className="input-glow" />
              <input
                type="text"
                name="industryClassification"
                value={formData.industryClassification}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Software, Manufacturing"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Market Rate Reference</span>
            </label>
            <div className="input-container">
              <div className="input-glow" />
              <input
                type="text"
                name="marketRateReference"
                value={formData.marketRateReference}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. $150/hr (Industry Avg)"
              />
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
                  Registering...
                </>
              ) : (
                'Register Vendor'
              )}
            </button>
          </div>

          <div className="form-footer">
            <div className="hint-text">
              <span className="hint-icon">ℹ</span>
              All financial data will be encrypted
            </div>
          </div>
        </form>
      </Html>
    </group>
  );
});

export default VendorForm;
