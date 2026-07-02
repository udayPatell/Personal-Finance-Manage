import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { IoAddOutline, IoTrashOutline, IoListOutline, IoCheckmarkCircle, IoCalendarOutline } from 'react-icons/io5';
import Button from '../common/Button';
import Card from '../common/Card';
import confetti from 'canvas-confetti';

export const GoalCard = ({ goal, onEdit }) => {
  const { deleteSavingsGoal, addContribution, currency, showToast } = useFinance();
  const [showHistory, setShowHistory] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const percentage = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
  const isReached = goal.savedAmount >= goal.targetAmount;

  // SVG Progress Ring calculations
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const handleAddSavings = (e) => {
    e.preventDefault();
    const numAmt = parseFloat(amount);
    
    if (isNaN(numAmt) || numAmt <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    const wasReached = goal.savedAmount >= goal.targetAmount;
    
    addContribution(goal.id, numAmt, date);
    
    // Check if goal is newly completed
    if (!wasReached && (goal.savedAmount + numAmt >= goal.targetAmount)) {
      // Fire confetti celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      showToast(`Congratulations! You reached your goal "${goal.name}"! 🎉`, 'success');
    } else {
      showToast(`Added ${formatCurrency(numAmt, currency.code, currency.symbol)} to "${goal.name}"`, 'success');
    }

    setAmount('');
    setShowAdd(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete savings goal "${goal.name}"?`)) {
      deleteSavingsGoal(goal.id);
      showToast('Savings goal deleted', 'info');
    }
  };

  return (
    <Card className="goal-progress-card flex-column gap-md">
      <div className="goal-card-header flex-between">
        <div className="goal-title-wrapper flex-center gap-sm">
          <span className="goal-status-dot" style={{ backgroundColor: goal.color }}></span>
          <span className="goal-title font-bold">{goal.name}</span>
        </div>
        <div className="goal-header-actions flex-center gap-sm">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(goal)}
            className="action-icon-btn"
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            className="action-icon-btn action-delete-btn"
            icon={IoTrashOutline}
          />
        </div>
      </div>

      <div className="goal-card-middle flex-center gap-lg">
        {/* SVG Circular Ring */}
        <div className="progress-ring-wrapper">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring-bg"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
            <circle
              className="progress-ring-fill"
              stroke={goal.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
          </svg>
          <div className="progress-ring-text flex-center flex-column">
            <span className="ring-percentage font-mono font-bold">
              {percentage.toFixed(0)}%
            </span>
            <span className="ring-lbl">Saved</span>
          </div>
        </div>

        {/* Text Details */}
        <div className="goal-card-details flex-column gap-sm">
          <div className="goal-amounts">
            <span className="goal-saved-val font-mono font-bold">
              {formatCurrency(goal.savedAmount, currency.code, currency.symbol)}
            </span>
            <span className="goal-slash"> / </span>
            <span className="goal-target-val font-mono text-muted text-sm">
              {formatCurrency(goal.targetAmount, currency.code, currency.symbol)}
            </span>
          </div>

          <div className="goal-meta flex-column gap-sm text-sm">
            <span className="flex-center gap-sm text-muted">
              <IoCalendarOutline /> Target: {formatDate(goal.deadline)}
            </span>
            {isReached ? (
              <span className="text-success flex-center gap-sm font-bold">
                <IoCheckmarkCircle /> Goal Achieved!
              </span>
            ) : (
              <span className="text-muted">
                Need: <strong className="font-mono text-primary">{formatCurrency(goal.targetAmount - goal.savedAmount, currency.code, currency.symbol)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="goal-card-actions-row flex-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowHistory(!showHistory);
            setShowAdd(false);
          }}
          icon={IoListOutline}
        >
          {showHistory ? 'Hide History' : 'History'}
        </Button>

        <Button
          variant={isReached ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => {
            setShowAdd(!showAdd);
            setShowHistory(false);
          }}
          icon={IoAddOutline}
          disabled={isReached}
        >
          Add Funds
        </Button>
      </div>

      {/* Add Contribution Panel */}
      {showAdd && (
        <form onSubmit={handleAddSavings} className="add-contribution-form flex-column gap-sm">
          <div className="form-grid">
            <div className="form-group mb-0">
              <input
                type="number"
                step="any"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input text-sm"
                required
                autoFocus
              />
            </div>
            <div className="form-group mb-0">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input text-sm"
                required
              />
            </div>
          </div>
          <div className="flex-between">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" size="sm">
              Confirm Add
            </Button>
          </div>
        </form>
      )}

      {/* History log collapsible dropdown */}
      {showHistory && (
        <div className="contribution-history-list">
          <span className="history-subtitle text-xs text-muted uppercase font-bold">
            Contribution Logs
          </span>
          {(goal.contributions || []).length === 0 ? (
            <span className="no-history-text text-sm text-muted">No saving logs recorded yet.</span>
          ) : (
            <div className="history-items-container flex-column gap-sm">
              {goal.contributions.map((c, i) => (
                <div key={i} className="history-item flex-between text-sm">
                  <span className="history-date font-mono text-muted">{formatDate(c.date)}</span>
                  <span className="history-amount font-mono font-bold text-income">
                    + {formatCurrency(c.amount, currency.code, currency.symbol)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default GoalCard;
