import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { IoCalendarOutline, IoCheckmarkCircleOutline, IoEllipseOutline, IoTrashOutline, IoSyncOutline } from 'react-icons/io5';
import Button from '../common/Button';
import Card from '../common/Card';
import { differenceInDays, parseISO } from 'date-fns';

export const BillCard = ({ bill, onEdit }) => {
  const { deleteBill, toggleBillPaid, addTransaction, currency, showToast } = useFinance();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = parseISO(bill.dueDate);
  const daysDiff = differenceInDays(dueDate, today);

  const isOverdue = !bill.isPaid && daysDiff < 0;
  const isUpcoming = !bill.isPaid && daysDiff >= 0 && daysDiff <= 7;

  let statusClass = 'status-unpaid';
  let statusText = 'Unpaid';
  if (bill.isPaid) {
    statusClass = 'status-paid';
    statusText = 'Paid';
  } else if (isOverdue) {
    statusClass = 'status-overdue';
    statusText = `Overdue by ${Math.abs(daysDiff)} days`;
  } else if (isUpcoming) {
    statusClass = 'status-due-soon';
    statusText = daysDiff === 0 ? 'Due Today' : `Due in ${daysDiff} days`;
  }

  const handleTogglePaid = () => {
    const nextPaidState = !bill.isPaid;
    toggleBillPaid(bill.id);

    if (nextPaidState) {
      // Auto-record a transaction for this bill payment
      addTransaction({
        type: 'expense',
        amount: bill.amount,
        category: bill.category,
        description: `Bill paid: ${bill.name}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer'
      });
      showToast(`Bill marked as paid! Automatically recorded transaction.`, 'success');
    } else {
      showToast(`Bill marked as unpaid.`, 'info');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete bill reminder for "${bill.name}"?`)) {
      deleteBill(bill.id);
      showToast('Bill reminder deleted', 'info');
    }
  };

  return (
    <Card className={`bill-reminder-card ${statusClass} flex-column gap-sm`}>
      <div className="bill-card-top flex-between">
        <div className="bill-card-title-group">
          <span className="bill-card-name font-bold">{bill.name}</span>
          <span className="bill-card-cat text-xs text-muted">{bill.category}</span>
        </div>
        <div className="bill-card-actions flex-center gap-sm">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(bill)}
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

      <div className="bill-card-middle flex-between">
        <div className="bill-due-details flex-column gap-xs">
          <span className="bill-amount-label text-muted text-xs uppercase font-bold">Amount</span>
          <span className="bill-amount-val font-mono font-bold">
            {formatCurrency(bill.amount, currency.code, currency.symbol)}
          </span>
        </div>

        <div className="bill-due-details flex-column gap-xs align-end">
          <span className="bill-amount-label text-muted text-xs uppercase font-bold">Due Date</span>
          <span className="bill-due-val font-mono">
            {formatDate(bill.dueDate, 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      <div className="bill-card-bottom flex-between">
        {/* Recurrence Badge */}
        <div className="bill-recurrence flex-center gap-xs text-xs text-muted">
          <IoSyncOutline />
          <span className="capitalize">{bill.recurrence}</span>
        </div>

        {/* Paid Action Toggler */}
        <button
          type="button"
          onClick={handleTogglePaid}
          className={`bill-pay-toggle-btn flex-center gap-sm ${bill.isPaid ? 'paid' : ''}`}
        >
          {bill.isPaid ? (
            <>
              <IoCheckmarkCircleOutline className="pay-toggle-icon" />
              <span>Paid</span>
            </>
          ) : (
            <>
              <IoEllipseOutline className="pay-toggle-icon" />
              <span>Mark Paid</span>
            </>
          )}
        </button>
      </div>

      {/* Small status banner */}
      <div className="bill-status-banner">
        <span className="status-label">{statusText}</span>
      </div>
    </Card>
  );
};

export default BillCard;
