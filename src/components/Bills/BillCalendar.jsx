import React, { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  format,
  parseISO
} from 'date-fns';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';
import Button from '../common/Button';

export const BillCalendar = ({ selectedMonthKey }) => {
  const { bills, toggleBillPaid, currency } = useFinance();
  const [selectedDate, setSelectedDate] = useState(null);

  // Parse current year-month key (YYYY-MM)
  const currentMonthDate = useMemo(() => {
    if (!selectedMonthKey) return new Date();
    const [year, month] = selectedMonthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  }, [selectedMonthKey]);

  // Compute days range for grid calendar cell rendering
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonthDate]);

  // Map bills by date for quick calendar lookups
  const billsByDate = useMemo(() => {
    const map = {};
    bills.forEach((bill) => {
      const dKey = bill.dueDate;
      if (!map[dKey]) map[dKey] = [];
      map[dKey].push(bill);
    });
    return map;
  }, [bills]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayBills = (day) => {
    const key = format(day, 'yyyy-MM-dd');
    return billsByDate[key] || [];
  };

  const handleDayClick = (day) => {
    const key = format(day, 'yyyy-MM-dd');
    setSelectedDate(key);
  };

  const activeBillsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return billsByDate[selectedDate] || [];
  }, [selectedDate, billsByDate]);

  return (
    <Card className="bill-calendar-card flex-column gap-md">
      <h3 className="chart-card-title">Calendar Schedule</h3>
      
      <div className="calendar-grid-wrapper flex-column">
        {/* Calendar Weekday headers */}
        <div className="calendar-weekdays-grid">
          {weekdays.map((wd) => (
            <div key={wd} className="weekday-cell">
              {wd}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="calendar-days-grid">
          {days.map((day, idx) => {
            const isCurrentMonth = day.getMonth() === currentMonthDate.getMonth();
            const isDayToday = isToday(day);
            const dayBills = getDayBills(day);
            const formattedDayNum = format(day, 'd');
            const dayKey = format(day, 'yyyy-MM-dd');
            const isCellSelected = selectedDate === dayKey;

            // Determine day marker state based on bills due
            const hasUnpaid = dayBills.some(b => !b.isPaid);
            const hasPaid = dayBills.some(b => b.isPaid);
            const isOverdue = dayBills.some(b => {
              if (b.isPaid) return false;
              return new Date(b.dueDate) < new Date().setHours(0,0,0,0);
            });

            let cellIndicator = '';
            if (isOverdue) cellIndicator = 'indicator-overdue';
            else if (hasUnpaid) cellIndicator = 'indicator-upcoming';
            else if (hasPaid) cellIndicator = 'indicator-paid';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`day-cell ${isCurrentMonth ? '' : 'day-outside'} ${
                  isDayToday ? 'day-today' : ''
                } ${isCellSelected ? 'day-selected' : ''}`}
              >
                <span className="day-number">{formattedDayNum}</span>
                {dayBills.length > 0 && (
                  <span className={`day-bill-indicator-dot ${cellIndicator}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Bills Details */}
      {selectedDate && (
        <div className="selected-date-details border-top flex-column gap-sm">
          <span className="details-subtitle text-xs text-muted uppercase font-bold">
            Bills due on {format(parseISO(selectedDate), 'MMMM dd, yyyy')}
          </span>

          {activeBillsForSelectedDate.length === 0 ? (
            <p className="no-details-text text-sm text-muted">No bills due on this date.</p>
          ) : (
            <div className="selected-bills-list flex-column gap-sm">
              {activeBillsForSelectedDate.map((bill) => (
                <div key={bill.id} className="selected-bill-row flex-between text-sm">
                  <div className="row-info flex-column">
                    <span className="bill-row-name font-bold">{bill.name}</span>
                    <span className="bill-row-cat text-xs text-muted">{bill.category}</span>
                  </div>
                  <div className="row-actions flex-center gap-md">
                    <span className="bill-row-amount font-mono font-bold">
                      {formatCurrency(bill.amount, currency.code, currency.symbol)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleBillPaid(bill.id)}
                      className={`badge cursor-pointer ${
                        bill.isPaid ? 'badge-income' : 'badge-expense'
                      }`}
                    >
                      {bill.isPaid ? 'Paid' : 'Pay'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default BillCalendar;
