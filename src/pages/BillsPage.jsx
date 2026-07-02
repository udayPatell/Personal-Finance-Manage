import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { IoAddOutline, IoCalendarOutline, IoAlertCircleOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { getCurrentMonthKey, formatMonthName, formatCurrency } from '../utils/helpers';
import BillForm from '../components/Bills/BillForm';
import BillCard from '../components/Bills/BillCard';
import BillCalendar from '../components/Bills/BillCalendar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';

export const BillsPage = () => {
  const { bills, currency } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  // Filter bills to show in the active month
  const monthBills = bills.filter((b) => b.dueDate.substring(0, 7) === selectedMonth);

  // Calculate aggregates
  const totalUnpaid = monthBills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPaid = monthBills
    .filter((b) => b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  const overdueCount = monthBills.filter((b) => {
    if (b.isPaid) return false;
    return new Date(b.dueDate) < new Date().setHours(0, 0, 0, 0);
  }).length;

  // Unique list of YYYY-MM keys from due dates for dropdown selection
  const availableMonths = React.useMemo(() => {
    const monthsSet = new Set([getCurrentMonthKey()]);
    bills.forEach((b) => monthsSet.add(b.dueDate.substring(0, 7)));
    return Array.from(monthsSet).sort().reverse();
  }, [bills]);

  return (
    <div className="bills-page flex-column gap-lg">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Bills & Reminders</h1>
          <p className="page-subtitle">Schedule and pay your recurring bills on time.</p>
        </div>
        <div className="page-actions flex-center gap-sm">
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
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Bill summary aggregates */}
      <div className="summary-cards-grid">
        <Card className="summary-card card-expense">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Outstanding Bills</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(totalUnpaid, currency.code, currency.symbol)}
              </h3>
            </div>
            <div className="summary-card-icon-wrapper bg-expense-glow text-danger">
              <IoAlertCircleOutline className="summary-card-icon" />
            </div>
          </div>
        </Card>

        <Card className="summary-card card-income">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Total Paid Bills</span>
              <h3 className="summary-card-value font-mono">
                {formatCurrency(totalPaid, currency.code, currency.symbol)}
              </h3>
            </div>
            <div className="summary-card-icon-wrapper bg-success-glow text-success">
              <IoCheckmarkCircleOutline className="summary-card-icon" />
            </div>
          </div>
        </Card>

        <Card className="summary-card card-balance">
          <div className="summary-card-inner">
            <div className="summary-card-details">
              <span className="summary-card-label">Overdue Reminders</span>
              <h3 className="summary-card-value font-mono">
                {overdueCount} Reminder(s)
              </h3>
            </div>
            <div
              className={`summary-card-icon-wrapper ${
                overdueCount > 0 ? 'bg-danger-glow text-danger animate-pulse-slow' : 'bg-success-glow text-success'
              }`}
            >
              <IoAlertCircleOutline className="summary-card-icon" />
            </div>
          </div>
        </Card>
      </div>

      {/* Split grid: Cards list on left, custom calendar on right */}
      <div className="budget-grid-split">
        <div className="grid-col-7 flex-column gap-md">
          <h3 className="section-subtitle">Monthly Reminders list</h3>

          {monthBills.length === 0 ? (
            <EmptyState
              title="No Bills This Month"
              description="No bills scheduled for this month. Configure a new reminder to get alerts."
            />
          ) : (
            <div className="bills-cards-grid">
              {monthBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} onEdit={setEditingBill} />
              ))}
            </div>
          )}
        </div>

        <div className="grid-col-5">
          <BillCalendar selectedMonthKey={selectedMonth} />
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Schedule Bill Reminder"
        >
          <BillForm onClose={() => setIsAddOpen(false)} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingBill && (
        <Modal
          isOpen={!!editingBill}
          onClose={() => setEditingBill(null)}
          title="Modify Bill Reminder"
        >
          <BillForm initialData={editingBill} onClose={() => setEditingBill(null)} />
        </Modal>
      )}
    </div>
  );
};

export default BillsPage;
