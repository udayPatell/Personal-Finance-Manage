import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { getCurrentMonthKey } from '../../utils/helpers';
import Button from '../common/Button';

export const BudgetForm = ({ initialData, onClose }) => {
  const { categories, addBudget, showToast } = useFinance();

  const [category, setCategory] = useState(initialData?.category || '');
  const [limit, setLimit] = useState(initialData?.limit || '');
  const [month, setMonth] = useState(initialData?.month || getCurrentMonthKey());

  // Filter categories to only those that can have budgets (expenses or both)
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  useEffect(() => {
    if (expenseCategories.length > 0 && !category) {
      setCategory(expenseCategories[0].name);
    }
  }, [categories, category, expenseCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }

    if (!limit || parseFloat(limit) <= 0) {
      showToast('Please enter a valid limit amount', 'error');
      return;
    }

    addBudget({
      category,
      limit: parseFloat(limit),
      month
    });

    showToast('Budget configured successfully', 'success');
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="budget-form flex-column gap-md">
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-select"
          required
        >
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Monthly Limit</label>
          <input
            type="number"
            step="any"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="form-input"
            placeholder="0.00"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Active Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-actions flex-between">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Configure Limit
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;
