import React from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';

export const RecentTransactions = () => {
  const { transactions, categories, currency } = useFinance();

  // Pick last 5
  const recents = transactions.slice(0, 5);

  const getCategoryDetails = (catName) => {
    return (
      categories.find((c) => c.name.toLowerCase() === catName.toLowerCase()) || {
        icon: '🏷️',
        color: '#6B7280'
      }
    );
  };

  if (transactions.length === 0) {
    return (
      <Card className="dashboard-recents-card">
        <div className="card-header-actions flex-between">
          <h3 className="chart-card-title">Recent Activity</h3>
        </div>
        <EmptyState
          title="No Activity Yet"
          description="Ready to track? Start adding income or expense records."
        />
      </Card>
    );
  }

  return (
    <Card className="dashboard-recents-card">
      <div className="card-header-actions flex-between">
        <h3 className="chart-card-title">Recent Activity</h3>
        <Link to="/transactions" className="btn btn-secondary btn-sm">
          View All
        </Link>
      </div>

      <div className="recent-list">
        {recents.map((tx) => {
          const cat = getCategoryDetails(tx.category);
          const isIncome = tx.type === 'income';
          return (
            <div key={tx.id} className="recent-tx-item">
              <div className="recent-tx-left">
                <div
                  className="recent-cat-icon-wrapper"
                  style={{ backgroundColor: `${cat.color}1A`, border: `1px solid ${cat.color}33` }}
                >
                  <span className="recent-cat-icon">{cat.icon}</span>
                </div>
                <div className="recent-tx-details">
                  <span className="recent-tx-category">{tx.category}</span>
                  <span className="recent-tx-desc" title={tx.description}>
                    {tx.description || 'No description'}
                  </span>
                </div>
              </div>

              <div className="recent-tx-right">
                <span className={`recent-tx-amount font-mono ${isIncome ? 'text-income' : 'text-expense'}`}>
                  {isIncome ? '+' : '-'} {formatCurrency(tx.amount, currency.code, currency.symbol)}
                </span>
                <span className="recent-tx-date">{formatDate(tx.date, 'MMM dd')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentTransactions;
