// components/VendorList.tsx
import { Html } from '@react-three/drei';
import React, { useRef } from 'react';
import { COLORS } from '../../colors';
import type { Vendor } from '../vendor';

interface VendorListProps {
  vendors: Vendor[];
  onSelect: (vendor: Vendor) => void;
  selectedVendorId: number | null;
}

const VendorList = React.memo(({
  vendors,
  onSelect,
  selectedVendorId
}: VendorListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (listRef.current) {
      listRef.current.scrollTop += e.deltaY;
      e.stopPropagation();
    }
  };

  return (
    <Html
      transform
      center
      distanceFactor={10}
      position={[0, 0, 0]}
      style={{
        width: '360px',
        height: '600px',
        overflowY: 'auto',
        border: `solid 2px ${COLORS.PRIMARY}`,
        borderRadius: '8px',
      }}
      onWheel={handleWheel}
    >
      <div ref={listRef} className="vendor-list__scroll-container">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="vendor-list__item-container"
          >
            <div className="glow-effect glow-effect--primary" />
            <div
              className={`vendor-list__card ${selectedVendorId === vendor.id ? 'active' : ''}`}
              onClick={() => onSelect(vendor)}
            >
              <div className="vendor-list__header">
                <div className="vendor-list__name" title={vendor.legalName}>
                  {vendor.legalName}
                </div>
                <div className="vendor-list__industry">
                  {vendor.industryClassification || 'No industry'}
                </div>
              </div>
              <div className="vendor-list__footer">
                <span className="vendor-list__rate" title="Market rate reference">
                  {vendor.marketRateReference || 'No rate data'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Html>
  );
});

export default VendorList;
