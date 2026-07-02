import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export const ReportFilters = ({ filters, onChange, categories, onReset }) => {
  return (
    <Card className="filter-controls-card report-filters-card">
      <div className="search-filters-row">
        {/* Date Ranges */}
        <div className="date-pickers flex-center gap-sm">
          <div className="flex-column gap-xs">
            <span className="form-label mb-0 text-xs">Start Date</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="form-input date-input"
            />
          </div>
          <span className="filter-divider" style={{ marginTop: '1.25rem' }}>to</span>
          <div className="flex-column gap-xs">
            <span className="form-label mb-0 text-xs">End Date</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="form-input date-input"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex-column gap-xs" style={{ minWidth: '180px' }}>
          <span className="form-label mb-0 text-xs">Category Filter</span>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="form-select"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type */}
        <div className="flex-column gap-xs" style={{ minWidth: '150px' }}>
          <span className="form-label mb-0 text-xs">Cashflow Type</span>
          <select
            value={filters.type}
            onChange={(e) => onChange({ type: e.target.value })}
            className="form-select"
          >
            <option value="all">All Cashflow</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>

        <div className="flex-center" style={{ marginTop: '1.25rem', marginLeft: 'auto' }}>
          <Button variant="secondary" size="sm" onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;
