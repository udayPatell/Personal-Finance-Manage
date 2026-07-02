import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import Button from '../common/Button';

export const GoalForm = ({ initialData, onClose }) => {
  const { addSavingsGoal, updateSavingsGoal, showToast } = useFinance();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState(initialData?.targetAmount || '');
  const [savedAmount, setSavedAmount] = useState(initialData?.savedAmount || '0');
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [color, setColor] = useState(initialData?.color || '#7C3AED');

  const presetColors = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a goal name', 'error');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      showToast('Please enter a valid target amount', 'error');
      return;
    }

    if (parseFloat(savedAmount) < 0) {
      showToast('Saved amount cannot be negative', 'error');
      return;
    }

    if (!deadline) {
      showToast('Please specify a target deadline', 'error');
      return;
    }

    const payload = {
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount),
      deadline,
      color
    };

    if (isEdit) {
      updateSavingsGoal(initialData.id, payload);
      showToast('Savings goal updated', 'success');
    } else {
      addSavingsGoal(payload);
      showToast('Savings goal created!', 'success');
    }

    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="goal-form flex-column gap-md">
      <div className="form-group">
        <label className="form-label">Goal Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
          placeholder="e.g. New Laptop, Vacation Fund"
          required
          autoFocus
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Target Amount</label>
          <input
            type="number"
            step="any"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="form-input"
            placeholder="0.00"
            required
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label className="form-label">Initial Savings</label>
            <input
              type="number"
              step="any"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              className="form-input"
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Preset colors picker */}
        <div className="form-group">
          <label className="form-label">Color Theme</label>
          <div className="presets-wrapper flex-center gap-sm">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-preset-dot ${color === c ? 'active-preset' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="custom-color-input"
              title="Custom Color"
            />
          </div>
        </div>
      </div>

      <div className="form-actions flex-between">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? 'Save Changes' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;
