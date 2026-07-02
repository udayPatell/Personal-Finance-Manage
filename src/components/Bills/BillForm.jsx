import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import Button from '../common/Button';

export const BillForm = ({ initialData, onClose }) => {
  const { categories, addBill, updateBill, showToast } = useFinance();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate || new Date().toISOString().split('T')[0]
  );
  const [recurrence, setRecurrence] = useState(initialData?.recurrence || 'monthly');
  const [category, setCategory] = useState(initialData?.category || '');

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  useEffect(() => {
    if (expenseCategories.length > 0 && !category) {
      setCategory(expenseCategories[0].name);
    }
  }, [categories, category, expenseCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a bill name', 'error');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!dueDate) {
      showToast('Please select a due date', 'error');
      return;
    }

    const payload = {
      name,
      amount: parseFloat(amount),
      dueDate,
      recurrence,
      category
    };

    if (isEdit) {
      updateBill(initialData.id, payload);
      showToast('Bill reminder updated', 'success');
    } else {
      addBill(payload);
      showToast('Bill reminder scheduled', 'success');
    }

    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bill-form flex-column gap-md">
      <div className="form-group">
        <label className="form-label">Bill Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
          placeholder="e.g. Netflix Premium, Electricity bill"
          required
          autoFocus
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Recurrence</label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="form-select"
            required
          >
            <option value="one-time">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

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
      </div>

      <div className="form-actions flex-between">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? 'Save Changes' : 'Schedule Bill'}
        </Button>
      </div>
    </form>
  );
};

export default BillForm;
