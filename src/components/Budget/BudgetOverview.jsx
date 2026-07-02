import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

export const BudgetOverview = ({ budgetItems }) => {
  const { currency } = useFinance();

  const chartData = budgetItems.map((item) => ({
    name: item.category,
    Limit: item.limit,
    Spent: item.spent
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip glass-panel">
          <p className="tooltip-label font-bold">{label}</p>
          <div className="tooltip-row flex-between gap-md">
            <span style={{ color: 'var(--primary)' }}>Limit:</span>
            <span className="font-mono">
              {formatCurrency(payload[0].value, currency.code, currency.symbol)}
            </span>
          </div>
          <div className="tooltip-row flex-between gap-md">
            <span style={{ color: 'var(--accent-expense)' }}>Spent:</span>
            <span className="font-mono">
              {formatCurrency(payload[1].value, currency.code, currency.symbol)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="budget-overview-chart-card">
      <h3 className="chart-card-title">Budget vs. Actual Spent</h3>
      <div className="budget-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${currency.symbol}${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
            />
            <Bar dataKey="Limit" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Spent" fill="var(--accent-expense)" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BudgetOverview;
