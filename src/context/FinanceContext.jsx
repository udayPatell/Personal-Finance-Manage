import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_CATEGORIES, SAMPLE_DATA, CURRENCIES } from '../utils/constants';
import { generateId, getCurrentMonthKey } from '../utils/helpers';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  // Sync state with localStorage
  const [categories, setCategories] = useLocalStorage('pf_categories', DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useLocalStorage('pf_transactions', SAMPLE_DATA.transactions);
  const [budgets, setBudgets] = useLocalStorage('pf_budgets', SAMPLE_DATA.budgets);
  const [savingsGoals, setSavingsGoals] = useLocalStorage('pf_savingsGoals', SAMPLE_DATA.savingsGoals);
  const [bills, setBills] = useLocalStorage('pf_bills', SAMPLE_DATA.bills);
  
  const [currency, setCurrency] = useLocalStorage('pf_currency', CURRENCIES[0]); // default to USD
  const [theme, setTheme] = useLocalStorage('pf_theme', 'dark');
  const [toasts, setToasts] = React.useState([]);

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Trigger HTML theme updates
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Theme Toggler
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Currency Updater
  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrency(found);
    }
  };

  // --- Transactions CRUD ---
  const addTransaction = (tx) => {
    const newTx = {
      ...tx,
      id: tx.id || generateId(),
      amount: parseFloat(tx.amount),
      createdAt: tx.createdAt || Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (id, updatedTx) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updatedTx, amount: parseFloat(updatedTx.amount) } : tx))
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const bulkDeleteTransactions = (ids) => {
    setTransactions(prev => prev.filter(tx => !ids.includes(tx.id)));
  };

  const addBulkTransactions = (txs) => {
    const formatted = txs.map(tx => ({
      ...tx,
      id: tx.id || generateId(),
      amount: parseFloat(tx.amount),
      createdAt: tx.createdAt || Date.now()
    }));
    setTransactions(prev => [...formatted, ...prev]);
  };

  // --- Budgets CRUD ---
  const addBudget = (bg) => {
    // Check if category already has budget for this month
    const existingIndex = budgets.findIndex(
      b => b.category.toLowerCase() === bg.category.toLowerCase() && b.month === bg.month
    );

    if (existingIndex > -1) {
      const updated = [...budgets];
      updated[existingIndex].limit = parseFloat(bg.limit);
      setBudgets(updated);
    } else {
      const newBudget = {
        id: generateId(),
        category: bg.category,
        limit: parseFloat(bg.limit),
        month: bg.month || getCurrentMonthKey()
      };
      setBudgets(prev => [...prev, newBudget]);
    }
  };

  const updateBudget = (id, updatedBg) => {
    setBudgets(prev =>
      prev.map(b => (b.id === id ? { ...b, limit: parseFloat(updatedBg.limit), month: updatedBg.month } : b))
    );
  };

  const deleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // --- Savings Goals CRUD ---
  const addSavingsGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: generateId(),
      targetAmount: parseFloat(goal.targetAmount),
      savedAmount: parseFloat(goal.savedAmount || 0),
      color: goal.color || '#7C3AED',
      contributions: goal.contributions || [],
      createdAt: Date.now()
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id, updatedGoal) => {
    setSavingsGoals(prev =>
      prev.map(g =>
        g.id === id
          ? {
              ...g,
              ...updatedGoal,
              targetAmount: parseFloat(updatedGoal.targetAmount),
              savedAmount: parseFloat(updatedGoal.savedAmount)
            }
          : g
      )
    );
  };

  const deleteSavingsGoal = (id) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const addContribution = (goalId, amount, date) => {
    setSavingsGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const numVal = parseFloat(amount);
          const newContributions = [...(g.contributions || []), { amount: numVal, date: date || new Date().toISOString().split('T')[0] }];
          const newSaved = g.savedAmount + numVal;
          return {
            ...g,
            savedAmount: newSaved,
            contributions: newContributions
          };
        }
        return g;
      })
    );
  };

  // --- Bills CRUD ---
  const addBill = (bill) => {
    const newBill = {
      ...bill,
      id: generateId(),
      amount: parseFloat(bill.amount),
      isPaid: false,
      createdAt: Date.now()
    };
    setBills(prev => [...prev, newBill]);
  };

  const updateBill = (id, updatedBill) => {
    setBills(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updatedBill, amount: parseFloat(updatedBill.amount) } : b))
    );
  };

  const deleteBill = (id) => {
    setBills(prev => prev.filter(b => b.id !== id));
  };

  const toggleBillPaid = (id) => {
    setBills(prev =>
      prev.map(b => {
        if (b.id === id) {
          // If recurring, toggle or push date forward (here we just toggle paid state)
          return { ...b, isPaid: !b.isPaid };
        }
        return b;
      })
    );
  };

  // --- Categories CRUD ---
  const addCategory = (cat) => {
    const newCat = {
      ...cat,
      id: generateId()
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id, updatedCat) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updatedCat } : c)));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // --- Settings utilities ---
  const resetData = () => {
    setCategories(DEFAULT_CATEGORIES);
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setBills([]);
    setCurrency(CURRENCIES[0]);
    setTheme('dark');
  };

  const importData = (imported) => {
    try {
      if (imported.categories) setCategories(imported.categories);
      if (imported.transactions) setTransactions(imported.transactions);
      if (imported.budgets) setBudgets(imported.budgets);
      if (imported.savingsGoals) setSavingsGoals(imported.savingsGoals);
      if (imported.bills) setBills(imported.bills);
      if (imported.currency) setCurrency(imported.currency);
      if (imported.theme) setTheme(imported.theme || 'dark');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        transactions,
        budgets,
        savingsGoals,
        bills,
        currency,
        theme,
        toggleTheme,
        changeCurrency,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        bulkDeleteTransactions,
        addBulkTransactions,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addContribution,
        addBill,
        updateBill,
        deleteBill,
        toggleBillPaid,
        addCategory,
        updateCategory,
        deleteCategory,
        resetData,
        importData,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
