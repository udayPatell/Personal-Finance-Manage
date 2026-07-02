import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { getMonthKey } from '../utils/helpers';

export function useBudget(selectedMonth) {
  const { budgets, transactions } = useFinance();

  const budgetOverview = useMemo(() => {
    // 1. Get budgets for the selected month
    const monthBudgets = budgets.filter(b => b.month === selectedMonth);

    // 2. Filter transactions to expenses in the selected month
    const monthExpenses = transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      const txMonth = getMonthKey(tx.date);
      return txMonth === selectedMonth;
    });

    // 3. Compute spendings by category
    const categorySpendings = monthExpenses.reduce((acc, tx) => {
      const cat = tx.category;
      acc[cat] = (acc[cat] || 0) + tx.amount;
      return acc;
    }, {});

    // 4. Build budget list with details
    const list = monthBudgets.map(b => {
      const spent = categorySpendings[b.category] || 0;
      const limit = b.limit;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      
      let status = 'normal'; // normal, warning, exceeded
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        ...b,
        spent,
        percentage,
        status,
        overAmount: spent > limit ? spent - limit : 0
      };
    });

    // 5. Calculate totals
    const totalLimit = monthBudgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = list.reduce((sum, b) => sum + b.spent, 0);
    
    // Also include categories that don't have explicit budget limits, but have spending
    const budgetedCategories = new Set(monthBudgets.map(b => b.category));
    const unbudgetedList = [];
    Object.keys(categorySpendings).forEach(cat => {
      if (!budgetedCategories.has(cat)) {
        const spent = categorySpendings[cat];
        unbudgetedList.push({
          id: `unbudgeted-${cat}`,
          category: cat,
          limit: 0,
          spent,
          percentage: 0,
          status: 'unbudgeted',
          overAmount: 0
        });
      }
    });

    const exceededBudgets = list.filter(b => b.spent > b.limit);
    const warningBudgets = list.filter(b => b.spent >= b.limit * 0.8 && b.spent <= b.limit);

    return {
      budgetItems: list,
      unbudgetedItems: unbudgetedList,
      totalLimit,
      totalSpent,
      exceededBudgets,
      warningBudgets,
      totalSpentPercentage: totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
    };
  }, [budgets, transactions, selectedMonth]);

  return budgetOverview;
}
export default useBudget;
