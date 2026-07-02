import React from 'react';
import { IoTrendingUp, IoTrendingDown, IoWallet, IoSparkles } from 'react-icons/io5';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getCurrentMonthKey } from '../../utils/helpers';
import Card from '../common/Card';

export const SummaryCards = () => {
  const { transactions, savingsGoals, currency } = useFinance();
  const currentMonthKey = getCurrentMonthKey();

  // Filter transactions for this month
  const monthTransactions = transactions.filter(
    (tx) => tx.date.substring(0, 7) === currentMonthKey
  );

  // Income
  const income = monthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Expenses
  const expenses = monthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Balance
  const netBalance = income - expenses;

  // Monthly Savings contributions
  const savings = savingsGoals.reduce((sum, goal) => {
    const goalMonthContributions = (goal.contributions || [])
      .filter((c) => c.date.substring(0, 7) === currentMonthKey)
      .reduce((s, c) => s + c.amount, 0);
    return sum + goalMonthContributions;
  }, 0);

  const cardData = [
    {
      title: 'Monthly Income',
      value: income,
      icon: IoTrendingUp,
      className: 'card-income',
      accentColor: 'var(--accent-income)'
    },
    {
      title: 'Monthly Expenses',
      value: expenses,
      icon: IoTrendingDown,
      className: 'card-expense',
      accentColor: 'var(--accent-expense)'
    },
    {
      title: 'Net Balance',
      value: netBalance,
      icon: IoWallet,
      className: 'card-balance',
      accentColor: netBalance >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)'
    },
    {
      title: 'Saved This Month',
      value: savings,
      icon: IoSparkles,
      className: 'card-savings',
      accentColor: 'var(--accent-info)'
    }
  ];

  return (
    <div className="summary-cards-grid">
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className={`summary-card ${card.className}`} interactive>
            <div className="summary-card-inner">
              <div className="summary-card-details">
                <span className="summary-card-label">{card.title}</span>
                <h3 className="summary-card-value">
                  {formatCurrency(card.value, currency.code, currency.symbol)}
                </h3>
              </div>
              <div
                className="summary-card-icon-wrapper"
                style={{ backgroundColor: `${card.accentColor}1A`, color: card.accentColor }}
              >
                <Icon className="summary-card-icon" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCards;
