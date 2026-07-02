import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PAYMENT_METHODS } from '../../utils/constants';
import Button from '../common/Button';

export const TransactionForm = ({ initialData, onClose }) => {
  const { categories, addTransaction, updateTransaction, showToast } = useFinance();

  const isEdit = !!initialData;

  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [paymentMethod, setPaymentMethod] = useState(
    initialData?.paymentMethod || PAYMENT_METHODS[0]
  );

  // Filter categories by type
  const filteredCategories = categories.filter(
    (cat) => cat.type === type || cat.type === 'both'
  );

  // Auto-select first category if current is invalid
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const isCurrentValid = filteredCategories.some((c) => c.name === category);
      if (!isCurrentValid) {
        setCategory(filteredCategories[0].name);
      }
    } else {
      setCategory('');
    }
  }, [type, categories, category, filteredCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid positive amount', 'error');
      return;
    }

    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }

    const payload = {
      type,
      amount: parseFloat(amount),
      category,
      date,
      description,
      paymentMethod
    };

    if (isEdit) {
      updateTransaction(initialData.id, payload);
      showToast('Transaction updated successfully', 'success');
    } else {
      addTransaction(payload);
      showToast('Transaction added successfully', 'success');
    }

    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      {/* Type Toggle Tabs */}
      <div className="form-group flex-center type-tabs-group">
        <button
          type="button"
          className={`type-tab-btn tab-expense ${type === 'expense' ? 'active' : ''}`}
          onClick={() => setType('expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={`type-tab-btn tab-income ${type === 'income' ? 'active' : ''}`}
          onClick={() => setType('income')}
        >
          Income
        </button>
      </div>

      <div className="form-grid">
        {/* Amount */}
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
            autoFocus
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
            required
          >
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="form-select"
            required
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description (Optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
          placeholder="e.g. Grocery shopping, Salary bonus"
        />
      </div>

      <div className="form-actions flex-between">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
