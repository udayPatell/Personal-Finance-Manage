import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getCurrentMonthKey } from '../utils/helpers';
import { differenceInDays, parseISO } from 'date-fns';

export function useNotifications() {
  const { bills, transactions, budgets } = useFinance();
  const currentMonth = getCurrentMonthKey();

  const notifications = useMemo(() => {
    const list = [];

    // --- 1. Overdue and Upcoming Bills ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    bills.forEach(bill => {
      if (bill.isPaid) return;

      try {
        const dueDate = parseISO(bill.dueDate);
        const daysDiff = differenceInDays(dueDate, today);

        if (daysDiff < 0) {
          list.push({
            id: `notif-bill-overdue-${bill.id}`,
            type: 'bill-overdue',
            title: 'Bill Overdue',
            message: `"${bill.name}" of amount was due on ${bill.dueDate}`,
            amount: bill.amount,
            severity: 'error',
            refId: bill.id,
            days: Math.abs(daysDiff)
          });
        } else if (daysDiff <= 7) {
          list.push({
            id: `notif-bill-upcoming-${bill.id}`,
            type: 'bill-upcoming',
            title: daysDiff === 0 ? 'Bill Due Today' : 'Upcoming Bill',
            message: daysDiff === 0 
              ? `"${bill.name}" is due today!` 
              : `"${bill.name}" is due in ${daysDiff} days (${bill.dueDate})`,
            amount: bill.amount,
            severity: daysDiff === 0 ? 'warning' : 'info',
            refId: bill.id,
            days: daysDiff
          });
        }
      } catch (e) {
        console.error(e);
      }
    });

    // --- 2. Budget Alerts ---
    // Compute current month expenses by category
    const currentMonthExpenses = transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      const txMonth = tx.date.substring(0, 7);
      return txMonth === currentMonth;
    });

    const categorySpendings = currentMonthExpenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    const activeBudgets = budgets.filter(b => b.month === currentMonth);
    
    activeBudgets.forEach(b => {
      const spent = categorySpendings[b.category] || 0;
      const percentage = (spent / b.limit) * 100;

      if (spent > b.limit) {
        list.push({
          id: `notif-budget-exceeded-${b.id}`,
          type: 'budget-exceeded',
          title: 'Budget Limit Exceeded',
          message: `You've spent 100%+ of your budget on "${b.category}". (Spent ${spent.toFixed(2)} / Limit ${b.limit.toFixed(2)})`,
          severity: 'error',
          refId: b.id,
          category: b.category,
          percentage
        });
      } else if (percentage >= 80) {
        list.push({
          id: `notif-budget-warning-${b.id}`,
          type: 'budget-warning',
          title: 'Nearing Budget Limit',
          message: `You've spent ${percentage.toFixed(0)}% of your budget on "${b.category}". (Spent ${spent.toFixed(2)} / Limit ${b.limit.toFixed(2)})`,
          severity: 'warning',
          refId: b.id,
          category: b.category,
          percentage
        });
      }
    });

    return list;
  }, [bills, transactions, budgets, currentMonth]);

  return notifications;
}
export default useNotifications;
