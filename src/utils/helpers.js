import { format, parseISO } from 'date-fns';

/**
 * Format helper for currency display
 */
export const formatCurrency = (amount, currencyCode = 'USD', currencySymbol = '$') => {
  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parsedAmount);
  } catch {
    // Fallback if Intl fails or unsupported currency
    return `${currencySymbol}${parsedAmount.toFixed(2)}`;
  }
};

/**
 * Simple format helper for dates
 */
export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch {
    return dateString;
  }
};

/**
 * UUID generator fallback
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

/**
 * Get current year-month (YYYY-MM)
 */
export const getCurrentMonthKey = () => {
  return format(new Date(), 'yyyy-MM');
};
export const getMonthKey = (date) => {
  return format(new Date(date), 'yyyy-MM');
};
export const formatMonthName = (monthKey) => {
  if (!monthKey) return '';
  try {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMMM yyyy');
  } catch {
    return monthKey;
  }
};
