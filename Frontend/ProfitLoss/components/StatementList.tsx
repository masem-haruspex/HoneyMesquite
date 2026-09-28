import { useState, useRef, type Dispatch, type SetStateAction } from 'react';
import type { ProfitLossStatement, ProfitLossFilterState } from '../profitLoss';
import { Search, Plus, XIcon } from 'lucide-react';
import "./StatementList.scss";

interface StatementListProps {
  statements: ProfitLossStatement[];
  filteredStatements: ProfitLossStatement[];
  onSelect: (s: ProfitLossStatement) => void;
  onHover: (s: ProfitLossStatement | null) => void;
  filters: ProfitLossFilterState;
  setFilters: (f: ProfitLossFilterState) => void;
  setShowFormModal: Dispatch<SetStateAction<boolean>>;
}

export default function StatementList({
  statements,
  filteredStatements,
  onSelect,
  onHover,
  filters: externalFilters,
  setFilters: setExternalFilters,
  setShowFormModal,
}: StatementListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'list' | 'filter'>('list');

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (listRef.current) {
      listRef.current.scrollTop += e.deltaY;
      e.stopPropagation();
    }
  };

  const [tempFilters, setTempFilters] = useState<ProfitLossFilterState>(externalFilters);

  const allCategories = (() => {
    const set = new Set<number>();
    statements.forEach((s) =>
      s.lineItems?.forEach((item: any) => set.add(item.categoryId))
    );
    return Array.from(set).sort((a, b) => a - b);
  })();

  useState(() => {
    const nextCatFilters = { ...tempFilters.categoryFilters };
    let changed = false;
    allCategories.forEach((id) => {
      if (!(id in nextCatFilters)) {
        nextCatFilters[id] = true;
        changed = true;
      }
    });
    if (changed) {
      setTempFilters((prev) => ({ ...prev, categoryFilters: nextCatFilters }));
    }
  });

  const handleApply = () => {
    setExternalFilters(tempFilters);
    setView('list');
  };

  const handleReset = () => {
    const defaultCats = allCategories.reduce((acc, id) => ({ ...acc, [id]: true }), {});
    setTempFilters({
      ...externalFilters,
      categoryFilters: defaultCats,
      searchTerm: '',
      startDate: '',
      endDate: '',
      minNetIncome: '',
      maxNetIncome: '',
      minRevenue: '',
      maxRevenue: '',
      minMargin: '',
      maxMargin: '',
      isForecast: null,
      sortBy: 'date',
      sortDirection: 'desc',
    });
  };

  return (
      <div className="statement-list-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {view === 'list' && (
          <div key="list" className="statement-list-view">
            <div className="statement-list-header-row">
              <div className="statement-list-title">PROFIT & LOSS</div>

              <div className="statement-list-actions">
                <button
                  className="statement-list-icon-btn"
                  onClick={() => setView('filter')}
                  title="Open Filter"
                >
                  <Search size={18} strokeWidth={2} />
                </button>

                <button
                  className="statement-list-icon-btn"
                  onClick={() => setShowFormModal(true)}
                  title="Add New Statement"
                >
                  <Plus size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div
              ref={listRef}
              className="statement-list-scroll-container"
              onWheel={handleWheel}
            >
              {filteredStatements.length === 0 ? (
                <div className="statement-list-no-results">
                  No statements match filters.
                </div>
              ) : (
                filteredStatements.map((statement) => (
                  <div
                    key={statement.id}
                    className="statement-list-item-container"
                    onMouseEnter={() => onHover(statement)}
                    onMouseLeave={() => onHover(null)}
                  >
                    <div className="glow-effect" />
                    <div
                      className="statement-list-card"
                      onClick={() => onSelect(statement)}
                    >
                      <div className="statement-list-header">
                        <div
                          className="statement-list-period"
                          title={statement.periodName}
                        >
                          {statement.periodName}
                        </div>
                        <div
                          className={`statement-list-net-income ${
                            parseFloat(statement.netIncome || '0') < 0
                              ? 'statement-list-net-income--expense'
                              : 'statement-list-net-income--income'
                          }`}
                        >
                          ${parseFloat(statement.netIncome || '0').toLocaleString()}
                        </div>
                      </div>
                      <div className="statement-list-footer">
                        <span className="statement-list-dates">
                          {new Date(statement.periodStart).toLocaleDateString()} -{' '}
                          {new Date(statement.periodEnd).toLocaleDateString()}
                        </span>
                        <span className="statement-list-margin">
                          {statement.marginPercentage || '0'}% margin
                        </span>
                      </div>
                      {statement.isForecast && (
                        <div className="statement-list-forecast-badge">FORECAST</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'filter' && (
          <div key="filter" className="statement-list-view">
            <div className="statement-filter-form">
              <div className="statement-filter-header">
                <strong>🔍 FILTER STATEMENTS</strong>
                <button
                  className="statement-filter-close-btn"
                  onClick={() => setView('list')}
                  title="Back to List"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Period Name</label>
                <input
                  type="text"
                  value={tempFilters.searchTerm}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, searchTerm: e.target.value })
                  }
                  className="statement-filter-input"
                  placeholder="e.g. Q1"
                />
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Start Date</label>
                <input
                  type="date"
                  value={tempFilters.startDate}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, startDate: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>
              <div className="statement-filter-row">
                <label className="statement-filter-label">End Date</label>
                <input
                  type="date"
                  value={tempFilters.endDate}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, endDate: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Min Net Income</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={tempFilters.minNetIncome}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, minNetIncome: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>
              <div className="statement-filter-row">
                <label className="statement-filter-label">Max Net Income</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={tempFilters.maxNetIncome}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, maxNetIncome: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Min Revenue</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={tempFilters.minRevenue}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, minRevenue: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>
              <div className="statement-filter-row">
                <label className="statement-filter-label">Max Revenue</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={tempFilters.maxRevenue}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, maxRevenue: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Min Margin (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={tempFilters.minMargin}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, minMargin: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>
              <div className="statement-filter-row">
                <label className="statement-filter-label">Max Margin (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={tempFilters.maxMargin}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, maxMargin: e.target.value })
                  }
                  className="statement-filter-input"
                />
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Forecast</label>
                <select
                  value={tempFilters.isForecast === null ? 'all' : tempFilters.isForecast.toString()}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      isForecast:
                        e.target.value === 'all'
                          ? null
                          : e.target.value === 'true',
                    })
                  }
                  className="statement-filter-input"
                >
                  <option value="all">All</option>
                  <option value="true">Only Forecast</option>
                  <option value="false">Only Actual</option>
                </select>
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Sort By</label>
                <select
                  value={tempFilters.sortBy}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      sortBy: e.target.value as any,
                    })
                  }
                  className="statement-filter-input"
                >
                  <option value="date">Date</option>
                  <option value="netIncome">Net Income</option>
                  <option value="revenue">Revenue</option>
                  <option value="margin">Margin</option>
                </select>
              </div>
              <div className="statement-filter-row">
                <label className="statement-filter-label">Order</label>
                <select
                  value={tempFilters.sortDirection}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      sortDirection: e.target.value as any,
                    })
                  }
                  className="statement-filter-input"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div className="statement-filter-row">
                <label className="statement-filter-label">Category Filters</label>
                <div className="statement-filter-category-grid">
                  {allCategories.map((id) => (
                    <label key={id} className="statement-filter-category-label">
                      <input
                        type="checkbox"
                        checked={tempFilters.categoryFilters[id] ?? true}
                        onChange={(e) =>
                          setTempFilters({
                            ...tempFilters,
                            categoryFilters: {
                              ...tempFilters.categoryFilters,
                              [id]: e.target.checked,
                            },
                          })
                        }
                      />
                      Cat {id}
                    </label>
                  ))}
                </div>
              </div>

              <div className="statement-filter-actions">
                <button
                  className="statement-filter-btn statement-filter-btn-reset"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button
                  className="statement-filter-btn statement-filter-btn-apply"
                  onClick={handleApply}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
