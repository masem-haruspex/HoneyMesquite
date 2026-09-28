import React, { useRef } from 'react';
import { COLORS } from '../../colors';
import type { BudgetVsActualResponse } from '../budget';
import '../Budget.scss';

interface BudgetListProps {
  items: BudgetVsActualResponse[];
  onSelect: (id: number) => void;
  selectedId: number | null;
}

const BudgetList = React.memo(({
  items,
  onSelect,
  selectedId
}: BudgetListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (listRef.current) {
      listRef.current.scrollTop += e.deltaY;
      e.stopPropagation(); 
    }
  };

  return (
    <div
      ref={listRef}
      className="budget-list__scroll"
      onWheel={handleWheel}
    >
      {items.map((item) => (
        <div
          key={item.allocationId}
            style={{ cursor: 'pointer' }}
          className={`budget-list__item-container ${
            selectedId === item.allocationId ? 'budget-list__item-container active' : ''
          }`}
        >
          <div
            className="budget-list__card"
            onClick={() => onSelect(item.allocationId)}
          >
            <div className="budget-list__header">
              <div
                className="budget-list__name"
                title={`${item.categoryName} (${item.quarter})`}
              >
                {item.categoryName}{' '}
                <span className="budget-list__quarter">{item.quarter}</span>
              </div>
              <div
                className="budget-list__variance"
                style={{
                  color: item.variance < 0 ? COLORS.EXPENSE : COLORS.INCOME
                }}
              >
                {item.variance >= 0 ? '+' : ''}
                {Math.abs(item.variance).toLocaleString()}
              </div>
            </div>
            <div className="budget-list__footer">
              <span
                className="budget-list__budget"
                title={`Budget: $${item.budgetedAmount.toLocaleString()}`}
              >
                ${item.budgetedAmount.toLocaleString()}
              </span>
              <span
                className="budget-list__actual"
                title={`Actual: $${item.actualAmount.toLocaleString()}`}
              >
                ${item.actualAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default BudgetList;
