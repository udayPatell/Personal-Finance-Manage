import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useBudget } from '../hooks/useBudget';
import { getCurrentMonthKey, formatMonthName, formatCurrency } from '../utils/helpers';
import { IoAddOutline, IoWarning, IoTrendingDown, IoTrendingUp } from 'react-icons/io5';
import BudgetForm from '../components/Budget/BudgetForm';
import BudgetOverview from '../components/Budget/BudgetOverview';
import BudgetProgress from '../components/Budget/BudgetProgress';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

export const BudgetPage = () => {
  const { currency } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Retrieve budget details for the chosen month
  const budget = useBudget(selectedMonth);

  const overallPercentage = Math.min(budget.totalSpentPercentage, 100);

  let overallBarClass = 'progress-normal';
  if (budget.totalSpentPercentage >= 100) {
    overallBarClass = 'progress-exceeded';
  } else if (budget.totalSpentPercentage >= 80) {
    overallBarClass = 'progress-warning';
  }

  // List of unique months from budgets & transactions to populate month selector
  const { budgets, transactions } = useFinance();
  const availableMonths = React.useMemo(() => {
    const monthsSet = new Set([getCurrentMonthKey()]);
    budgets.forEach((b) => monthsSet.add(b.month));
    transactions.forEach((tx) => monthsSet.add(tx.date.substring(0, 7)));
    return Array.from(monthsSet).sort().reverse();
  }, [budgets, transactions]);

  return (
    <div className="budget-page flex-column gap-lg">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Monthly Budgets</h1>
          <p className="page-subtitle">Configure and monitor category-wise spending limits.</p>
        </div>
        <div className="page-actions flex-center gap-sm">
          {/* Month Picker */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-select month-picker-select"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthName(m)}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            icon={IoAddOutline}
          >
            Configure Limit
          </Button>
        </div>
      </div>

      {/* Budget Summary Aggregates */}
      <div className="summary-cards-grid">
        <Card className="summary-card card-balance">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Total Limit</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(budget.totalLimit, currency.code, currency.symbol)}
              </h3>
            </div>
            <div className="summary-card-icon-wrapper bg-primary-glow text-primary">
              <IoTrendingUp className="summary-card-icon" />
            </div>
          </div>
        </Card>

        <Card className="summary-card card-expense">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Total Spent</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(budget.totalSpent, currency.code, currency.symbol)}
              </h3>
            </div>
            <div className="summary-card-icon-wrapper bg-expense-glow text-danger">
              <IoTrendingDown className="summary-card-icon" />
            </div>
          </div>
        </Card>

        <Card className="summary-card card-savings">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Breached Categories</span>
              <h3 className="summary-card-value font-mono">
                {budget.exceededBudgets.length} / {budget.budgetItems.length}
              </h3>
            </div>
            <div
              className={`summary-card-icon-wrapper ${budget.exceededBudgets.length > 0 ? 'bg-danger-glow text-danger' : 'bg-success-glow text-success'
                }`}
            >
              <IoWarning className="summary-card-icon" />
            </div>
          </div>
        </Card>
      </div>

      {/* Overall Budget Progress Indicator */}
      {budget.totalLimit > 0 && (
        <Card className="overall-budget-progress flex-column gap-sm">
          <div className="flex-between">
            <span className="overall-progress-title font-bold">Overall Monthly Progress</span>
            <span className={`badge ${budget.totalSpentPercentage >= 100 ? 'badge-expense' : budget.totalSpentPercentage >= 80 ? 'badge-warning' : 'badge-income'
              }`}>
              {budget.totalSpentPercentage.toFixed(0)}% Consumed
            </span>
          </div>
          <div className="budget-progress-bar-container large-bar">
            <div
              className={`budget-progress-fill ${overallBarClass}`}
              style={{ width: `${overallPercentage}%` }}
            ></div>
          </div>
          <p className="overall-progress-text text-secondary text-sm">
            Spent {formatCurrency(budget.totalSpent, currency.code, currency.symbol)} out of your total limit of {formatCurrency(budget.totalLimit, currency.code, currency.symbol)}.
          </p>
        </Card>
      )}

      {/* Split Graph / List Grid */}
      <div className="budget-grid-split">
        <div className="grid-col-7">
          <BudgetProgress
            budgetItems={budget.budgetItems}
            unbudgetedItems={budget.unbudgetedItems}
          />
        </div>
        <div className="grid-col-5">
          <BudgetOverview budgetItems={budget.budgetItems} />
        </div>
      </div>

      {/* Configure Limit Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Configure Category Limit"
        >
          <BudgetForm onClose={() => setIsAddOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default BudgetPage;
