import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { isWithinInterval, parseISO } from 'date-fns';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { IoTrendingUp, IoTrendingDown, IoWallet, IoSparkles } from 'react-icons/io5';
import ReportFilters from '../components/Reports/ReportFilters';
import PDFExport from '../components/Reports/PDFExport';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';

export const ReportsPage = () => {
  const { transactions, categories, savingsGoals, currency } = useFinance();

  // Filter settings
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    type: 'all'
  });

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'all',
      type: 'all'
    });
  };

  // Filter transactions dynamically
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      // Type
      if (filters.type !== 'all' && tx.type !== filters.type) return false;

      // Category
      if (filters.category !== 'all' && tx.category !== filters.category) return false;

      // Date interval
      if (filters.startDate || filters.endDate) {
        try {
          const txDate = parseISO(tx.date);
          const start = filters.startDate ? parseISO(filters.startDate) : new Date(0);
          const end = filters.endDate ? parseISO(filters.endDate) : new Date(8640000000000000);
          if (!isWithinInterval(txDate, { start, end })) return false;
        } catch (e) {
          console.error(e);
        }
      }

      return true;
    });
  }, [transactions, filters]);

  // Aggregate Calculations
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    filteredTxs.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') expenses += tx.amount;
    });

    // Savings goals contribution within date range
    const savings = savingsGoals.reduce((sum, goal) => {
      const filteredContributions = (goal.contributions || []).filter(c => {
        if (filters.startDate || filters.endDate) {
          try {
            const cDate = parseISO(c.date);
            const start = filters.startDate ? parseISO(filters.startDate) : new Date(0);
            const end = filters.endDate ? parseISO(filters.endDate) : new Date(8640000000000000);
            return isWithinInterval(cDate, { start, end });
          } catch {
            return true;
          }
        }
        return true;
      });

      return sum + filteredContributions.reduce((s, c) => s + c.amount, 0);
    }, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      savingsContribution: savings
    };
  }, [filteredTxs, savingsGoals, filters]);

  // Donut chart category breakdown values
  const categoryChartData = useMemo(() => {
    const expenseTxs = filteredTxs.filter((t) => t.type === 'expense');
    const grouped = expenseTxs.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    return Object.keys(grouped).map((catName) => {
      const match = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
      return {
        name: catName,
        value: grouped[catName],
        color: match ? match.color : '#6B7280'
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredTxs, categories]);

  // Bar chart: Top categories limits
  const barChartData = useMemo(() => {
    return categoryChartData.slice(0, 5); // top 5
  }, [categoryChartData]);

  // Line chart: Daily cash flow trend
  const dailyTrendData = useMemo(() => {
    const grouped = filteredTxs.reduce((acc, tx) => {
      const dateKey = tx.date;
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, Income: 0, Expenses: 0 };
      if (tx.type === 'income') acc[dateKey].Income += tx.amount;
      else if (tx.type === 'expense') acc[dateKey].Expenses += tx.amount;
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort()
      .map(k => ({
        dateLabel: formatDate(k, 'MMM dd'),
        Income: grouped[k].Income,
        Expenses: grouped[k].Expenses
      }));
  }, [filteredTxs]);

  // Spikes: Days with highest expense spikes
  const dailySpikes = useMemo(() => {
    const expenseTxs = filteredTxs.filter((t) => t.type === 'expense');
    const grouped = expenseTxs.reduce((acc, tx) => {
      acc[tx.date] = (acc[tx.date] || 0) + tx.amount;
      return acc;
    }, {});

    return Object.keys(grouped)
      .map(d => ({ date: d, amount: grouped[d] }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // top 5 spike days
  }, [filteredTxs]);

  // Custom tooltips
  const TooltipCategory = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip glass-panel">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value font-mono">
            {formatCurrency(data.value, currency.code, currency.symbol)}
          </p>
        </div>
      );
    }
    return null;
  };

  const TooltipDaily = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip glass-panel">
          <p className="tooltip-label font-bold">{label}</p>
          {payload.map((p, i) => (
            <div key={i} className="tooltip-row flex-between gap-md" style={{ color: p.color }}>
              <span>{p.name}:</span>
              <span className="font-mono">
                {formatCurrency(p.value, currency.code, currency.symbol)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="reports-page flex-column gap-lg">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Deep dive analytics and professional statements export.</p>
        </div>
        <div className="page-actions flex-center gap-sm">
          <PDFExport
            filteredTransactions={filteredTxs}
            filters={filters}
            summary={summary}
          />
        </div>
      </div>

      {/* Analytics filter bar */}
      <ReportFilters
        filters={filters}
        onChange={handleFilterChange}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Aggregate summary cards */}
      <div className="summary-cards-grid">
        <Card className="summary-card card-income">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Total Income</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(summary.totalIncome, currency.code, currency.symbol)}
              </h3>
            </div>
            <div className="summary-card-icon-wrapper bg-success-glow text-success">
              <IoTrendingUp className="summary-card-icon" />
            </div>
          </div>
        </Card>

        <Card className="summary-card card-expense">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Total Expenses</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(summary.totalExpenses, currency.code, currency.symbol)}
              </h3>
            </div>
            <div className="summary-card-icon-wrapper bg-expense-glow text-danger">
              <IoTrendingDown className="summary-card-icon" />
            </div>
          </div>
        </Card>

        <Card className="summary-card card-balance">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Net Flow Balance</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(summary.netBalance, currency.code, currency.symbol)}
              </h3>
            </div>
            <div
              className={`summary-card-icon-wrapper ${
                summary.netBalance >= 0 ? 'bg-success-glow text-success' : 'bg-danger-glow text-danger'
              }`}
            >
              <IoWallet className="summary-card-icon" />
            </div>
          </div>
        </Card>

        <Card className="summary-card card-savings">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Goal Contributions</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(summary.savingsContribution, currency.code, currency.symbol)}
              </h3>
            </div>
            <div className="summary-card-icon-wrapper bg-primary-glow text-primary">
              <IoSparkles className="summary-card-icon" />
            </div>
          </div>
        </Card>
      </div>

      {filteredTxs.length === 0 ? (
        <EmptyState
          title="No Transactions to Analyze"
          description="Try broadening your reporting date ranges or category selection tags."
        />
      ) : (
        <>
          {/* Main Cash Flow Trend Line Graph */}
          <Card className="report-main-chart-card">
            <h3 className="chart-card-title">Daily Cash Flow Trend</h3>
            {dailyTrendData.length === 0 ? (
              <EmptyState title="Trend Unavailable" description="Insufficient cash flow records found." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis dataKey="dateLabel" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${currency.symbol}${v}`} />
                  <Tooltip content={<TooltipDaily />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Income" stroke="var(--accent-income)" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Expenses" stroke="var(--accent-expense)" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Secondary Splits Graphs: Donut Categories vs Top Categories Bar chart */}
          <div className="dashboard-grid-charts">
            <div className="grid-col-6">
              <Card className="dashboard-chart-card">
                <h3 className="chart-card-title">Expense Category Share</h3>
                {categoryChartData.length === 0 ? (
                  <EmptyState title="No expenses to show" description="No expense transactions matching criteria." />
                ) : (
                  <div className="spending-chart-wrapper">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<TooltipCategory />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend-grid">
                      {categoryChartData.map((item, idx) => {
                        const total = summary.totalExpenses;
                        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
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
                )}
              </Card>
            </div>

            <div className="grid-col-6">
              <Card className="dashboard-chart-card">
                <h3 className="chart-card-title">Top 5 Spending Categories</h3>
                {barChartData.length === 0 ? (
                  <EmptyState title="No expenses to rank" description="Top categories rank maps from expense logs." />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${currency.symbol}${v}`} />
                      <Tooltip content={<TooltipCategory />} />
                      <Bar
                        dataKey="value"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                      >
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>
          </div>

          {/* Daily spending spikes lists */}
          <div className="reports-page-bottom-row">
            <Card className="reports-spikes-card flex-column gap-md">
              <h3 className="chart-card-title">Highest Spending Days (Spikes)</h3>
              {dailySpikes.length === 0 ? (
                <p className="no-details-text text-sm text-muted">No expense spikes mapped.</p>
              ) : (
                <div className="spikes-list flex-column gap-sm">
                  {dailySpikes.map((item, idx) => (
                    <div key={idx} className="spike-row flex-between text-sm">
                      <div className="spike-left flex-center gap-md">
                        <span className="spike-rank-num">#{idx + 1}</span>
                        <span className="spike-date font-mono">{formatDate(item.date, 'EEEE, MMM dd, yyyy')}</span>
                      </div>
                      <span className="spike-amount font-mono font-bold text-expense">
                        {formatCurrency(item.amount, currency.code, currency.symbol)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
