import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { isWithinInterval, parseISO } from 'date-fns';

export function useTransactions() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    addBulkTransactions
  } = useFinance();

  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // 'all' | 'income' | 'expense'
    category: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date', // 'date' | 'amount'
    sortOrder: 'desc' // 'asc' | 'desc'
  });

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Search filter (description & category)
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const descMatch = tx.description?.toLowerCase().includes(searchLower);
          const catMatch = tx.category?.toLowerCase().includes(searchLower);
          if (!descMatch && !catMatch) return false;
        }

        // Type filter
        if (filters.type !== 'all' && tx.type !== filters.type) {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && tx.category !== filters.category) {
          return false;
        }

        // Amount ranges
        if (filters.minAmount !== '' && tx.amount < parseFloat(filters.minAmount)) {
          return false;
        }
        if (filters.maxAmount !== '' && tx.amount > parseFloat(filters.maxAmount)) {
          return false;
        }

        // Date range filters
        if (filters.startDate || filters.endDate) {
          try {
            const txDate = parseISO(tx.date);
            const start = filters.startDate ? parseISO(filters.startDate) : new Date(0);
            const end = filters.endDate ? parseISO(filters.endDate) : new Date(8640000000000000);
            if (!isWithinInterval(txDate, { start, end })) {
              return false;
            }
          } catch (e) {
            console.error('Error filtering dates', e);
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA, valB;
        if (filters.sortBy === 'amount') {
          valA = a.amount;
          valB = b.amount;
        } else {
          // default date sorting
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }

        if (filters.sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [transactions, filters]);

  return {
    transactions,
    filteredTransactions,
    filters,
    updateFilters,
    resetFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkDeleteTransactions,
    addBulkTransactions
  };
}
export default useTransactions;
