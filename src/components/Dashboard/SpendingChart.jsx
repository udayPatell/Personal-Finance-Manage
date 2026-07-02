import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, getCurrentMonthKey } from '../../utils/helpers';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';

export const SpendingChart = () => {
  const { transactions, categories, currency } = useFinance();
  const currentMonthKey = getCurrentMonthKey();

  // Filter expenses for this month
  const expenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date.substring(0, 7) === currentMonthKey
  );

  // Group by category name and sum amounts
  const groupedData = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  // Form data for Recharts, inject color from active categories
  const chartData = Object.keys(groupedData).map((catName) => {
    const matchedCat = categories.find(
      (c) => c.name.toLowerCase() === catName.toLowerCase()
    );
    return {
      name: catName,
      value: groupedData[catName],
      color: matchedCat ? matchedCat.color : '#6B7280'
    };
  }).sort((a, b) => b.value - a.value);

  const totalExpense = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalExpense > 0 ? ((data.value / totalExpense) * 100).toFixed(1) : 0;
      return (
        <div className="chart-tooltip glass-panel">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value font-mono">
            {formatCurrency(data.value, currency.code, currency.symbol)}
          </p>
          <p className="tooltip-percent">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className="dashboard-chart-card">
        <h3 className="chart-card-title">Spending Breakdown</h3>
        <EmptyState
          title="No Expenses Tracked"
          description="Track your first expense this month to see the category breakdown."
        />
      </Card>
    );
  }

  return (
    <Card className="dashboard-chart-card">
      <h3 className="chart-card-title">Spending Breakdown</h3>
      <div className="spending-chart-wrapper">
        <div className="pie-container">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center-label">
            <span className="donut-label-sub">Total Spent</span>
            <span className="donut-label-val font-mono">
              {formatCurrency(totalExpense, currency.code, currency.symbol)}
            </span>
          </div>
        </div>

        {/* Custom Legend for Categories */}
        <div className="chart-legend-grid">
          {chartData.map((item, idx) => {
            const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(0) : 0;
            return (
              <div key={idx} className="legend-item">
                <span className="legend-bullet" style={{ backgroundColor: item.color }}></span>
                <div className="legend-details">
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-values font-mono">
                    {formatCurrency(item.value, currency.code, currency.symbol)} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default SpendingChart;
