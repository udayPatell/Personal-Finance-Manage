import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/helpers';
import { IoTrashOutline, IoWarning } from 'react-icons/io5';
import Button from '../common/Button';
import Card from '../common/Card';

export const BudgetProgress = ({ budgetItems, unbudgetedItems }) => {
  const { categories, currency, deleteBudget, showToast } = useFinance();

  const getCategoryDetails = (catName) => {
    return (
      categories.find((c) => c.name.toLowerCase() === catName.toLowerCase()) || {
        icon: '🍕',
        color: '#6B7280'
      }
    );
  };

  const handleDelete = (id, catName) => {
    if (window.confirm(`Remove budget limit for "${catName}"?`)) {
      deleteBudget(id);
      showToast(`Removed budget for ${catName}`, 'info');
    }
  };

  return (
    <div className="budget-progress-section flex-column gap-md">
      <h3 className="section-subtitle">Category Allocation Details</h3>

      {budgetItems.length === 0 && unbudgetedItems.length === 0 ? (
        <Card className="p-lg text-center text-muted">
          No budget limits or spending recorded for this month.
        </Card>
      ) : (
        <div className="budget-progress-list">
          {/* Budgeted Items */}
          {budgetItems.map((item) => {
            const cat = getCategoryDetails(item.category);
            const isExceeded = item.status === 'exceeded';
            const isWarning = item.status === 'warning';
            const barPercentage = Math.min(item.percentage, 100);

            let barClass = 'progress-normal';
            if (isExceeded) barClass = 'progress-exceeded';
            else if (isWarning) barClass = 'progress-warning';

            return (
              <Card key={item.id} className="budget-progress-card flex-column gap-sm">
                <div className="budget-card-top flex-between">
                  <div className="budget-cat-info flex-center gap-sm">
                    <span className="budget-cat-icon">{cat.icon}</span>
                    <span className="budget-cat-name font-bold">{item.category}</span>
                  </div>
                  <div className="budget-card-actions flex-center gap-sm">
                    <span className={`badge ${
                      isExceeded ? 'badge-expense' : isWarning ? 'badge-warning' : 'badge-income'
                    }`}>
                      {item.percentage.toFixed(0)}% Used
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.category)}
                      icon={IoTrashOutline}
                      className="budget-delete-btn"
                      title="Remove Limit"
                    />
                  </div>
                </div>

                <div className="budget-progress-bar-container">
                  <div 
                    className={`budget-progress-fill ${barClass}`}
                    style={{ width: `${barPercentage}%` }}
                  ></div>
                </div>

                <div className="budget-card-bottom flex-between">
                  <span className="budget-spent-ratio">
                    Spent: <strong className="font-mono">{formatCurrency(item.spent, currency.code, currency.symbol)}</strong> of <span className="font-mono text-muted">{formatCurrency(item.limit, currency.code, currency.symbol)}</span>
                  </span>
                  {isExceeded && (
                    <span className="text-danger flex-center gap-sm text-sm font-bold">
                      <IoWarning /> Over by {formatCurrency(item.overAmount, currency.code, currency.symbol)}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Unbudgeted Items (with spending, but no limits set) */}
          {unbudgetedItems.map((item) => {
            const cat = getCategoryDetails(item.category);

            return (
              <Card key={item.id} className="budget-progress-card unbudgeted flex-column gap-sm">
                <div className="budget-card-top flex-between">
                  <div className="budget-cat-info flex-center gap-sm">
                    <span className="budget-cat-icon">{cat.icon}</span>
                    <span className="budget-cat-name font-bold">{item.category}</span>
                  </div>
                  <span className="badge badge-warning">No Limit Set</span>
                </div>

                <div className="budget-progress-bar-container">
                  <div className="budget-progress-fill progress-unbudgeted" style={{ width: '100%' }}></div>
                </div>

                <div className="budget-card-bottom flex-between">
                  <span className="budget-spent-ratio">
                    Spent: <strong className="font-mono">{formatCurrency(item.spent, currency.code, currency.symbol)}</strong> (Unbudgeted)
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
