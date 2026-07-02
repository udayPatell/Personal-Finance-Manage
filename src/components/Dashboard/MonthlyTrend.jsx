import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { subMonths, format } from 'date-fns';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';

export const MonthlyTrend = () => {
  const { transactions, currency } = useFinance();

  // Generate last 6 months keys & labels
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      key: format(date, 'yyyy-MM'),
      label: format(date, 'MMM yy')
    };
  });

  // Calculate income & expenses per month
  const chartData = last6Months.map(({ key, label }) => {
    const monthTx = transactions.filter((tx) => tx.date.substring(0, 7) === key);
    const income = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      name: label,
      Income: income,
      Expenses: expenses
    };
  });

  const hasData = chartData.some(d => d.Income > 0 || d.Expenses > 0);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip glass-panel">
          <p className="tooltip-label font-bold">{label}</p>
          <div className="tooltip-row flex-between gap-md">
            <span style={{ color: 'var(--accent-income)' }}>Income:</span>
            <span className="font-mono">
              {formatCurrency(payload[0].value, currency.code, currency.symbol)}
            </span>
          </div>
          <div className="tooltip-row flex-between gap-md">
            <span style={{ color: 'var(--accent-expense)' }}>Expenses:</span>
            <span className="font-mono">
              {formatCurrency(payload[1].value, currency.code, currency.symbol)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!hasData) {
    return (
      <Card className="dashboard-chart-card">
        <h3 className="chart-card-title">Cash Flow (6 Months)</h3>
        <EmptyState
          title="No Historical Flow"
          description="Insufficient transactions recorded to map monthly aggregates."
        />
      </Card>
    );
  }

  return (
    <Card className="dashboard-chart-card">
      <h3 className="chart-card-title">Cash Flow (6 Months)</h3>
      <div className="monthly-trend-chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-income)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-income)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-expense)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-expense)" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="Income"
              stroke="var(--accent-income)"
              fillOpacity={1}
              fill="url(#colorIncome)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Expenses"
              stroke="var(--accent-expense)"
              fillOpacity={1}
              fill="url(#colorExpense)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MonthlyTrend;
