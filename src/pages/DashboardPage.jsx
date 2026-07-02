import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotifications } from '../hooks/useNotifications';
import { formatCurrency, formatDate } from '../utils/helpers';
import { IoWarning, IoReceiptOutline, IoCalendarOutline, IoTrendingUp, IoTrendingDown } from 'react-icons/io5';
import SummaryCards from '../components/Dashboard/SummaryCards';
import SpendingChart from '../components/Dashboard/SpendingChart';
import MonthlyTrend from '../components/Dashboard/MonthlyTrend';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { bills, currency } = useFinance();
  const notifications = useNotifications();
  const navigate = useNavigate();

  // Filter out budget warning/exceeded notifications
  const budgetAlerts = notifications.filter(
    (n) => n.type === 'budget-exceeded' || n.type === 'budget-warning'
  );

  // Filter out bill alerts
  const billAlerts = notifications.filter(
    (n) => n.type === 'bill-overdue' || n.type === 'bill-upcoming'
  );

  // Get next 3 unpaid bills
  const upcomingBills = bills
    .filter((b) => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  return (
    <div className="dashboard-page flex-column gap-lg">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here is your financial overview.</p>
        </div>
        <div className="page-actions flex-center gap-sm">
          <Button variant="primary" size="md" onClick={() => navigate('/transactions')}>
            + Add Transaction
          </Button>
        </div>
      </div>

      {/* Budget Breaches / Alerts Banner */}
      {budgetAlerts.length > 0 && (
        <Card className="dashboard-alert-banner alert-glow-red flex-between gap-md">
          <div className="alert-content flex-center gap-md">
            <div className="alert-icon-wrapper">
              <IoWarning className="alert-banner-icon" />
            </div>
            <div className="alert-message">
              <span className="alert-title font-bold">Budget Warning!</span>
              <p className="alert-text text-secondary">
                You have exceeded or are nearing your limits in {budgetAlerts.length} budget categories.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/budget')}>
            Fix Budget
          </Button>
        </Card>
      )}

      {/* Main Aggregates */}
      <SummaryCards />

      {/* Graphs Layout */}
      <div className="dashboard-grid-charts">
        <div className="grid-col-8">
          <MonthlyTrend />
        </div>
        <div className="grid-col-4">
          <SpendingChart />
        </div>
      </div>

      {/* Bottom widgets: Recent Transactions & Bills */}
      <div className="dashboard-grid-bottom">
        <div className="grid-col-6">
          <RecentTransactions />
        </div>
        <div className="grid-col-6">
          <Card className="dashboard-upcoming-bills">
            <div className="card-header-actions flex-between">
              <h3 className="chart-card-title">Upcoming Bill Reminders</h3>
              <Button variant="secondary" size="sm" onClick={() => navigate('/bills')}>
                Manage Bills
              </Button>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="bills-empty flex-center flex-column gap-sm">
                <IoCalendarOutline className="bills-empty-icon" />
                <p className="bills-empty-text text-muted">No pending bills due soon.</p>
              </div>
            ) : (
              <div className="upcoming-bills-list">
                {upcomingBills.map((bill) => {
                  // Check if this bill has an active notification alert (e.g. overdue or due soon)
                  const matchedAlert = billAlerts.find((n) => n.refId === bill.id);
                  const isOverdue = matchedAlert && matchedAlert.type === 'bill-overdue';

                  return (
                    <div key={bill.id} className="upcoming-bill-row flex-between">
                      <div className="bill-left flex-center gap-md">
                        <div
                          className={`bill-status-indicator ${
                            isOverdue ? 'bg-danger-glow' : 'bg-warning-glow'
                          }`}
                        >
                          <IoCalendarOutline className="bill-row-icon" />
                        </div>
                        <div className="bill-info">
                          <span className="bill-title font-bold">{bill.name}</span>
                          <span className="bill-meta text-muted">
                            Due: {formatDate(bill.dueDate, 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>

                      <div className="bill-right flex-center gap-md">
                        <span className="bill-amount font-mono font-bold">
                          {formatCurrency(bill.amount, currency.code, currency.symbol)}
                        </span>
                        {isOverdue && <span className="badge badge-expense">Overdue</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
