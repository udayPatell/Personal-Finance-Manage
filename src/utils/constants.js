export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Food', icon: '🍕', color: '#F59E0B', type: 'expense' },
  { id: 'cat-2', name: 'Transport', icon: '🚗', color: '#3B82F6', type: 'expense' },
  { id: 'cat-3', name: 'Housing', icon: '🏠', color: '#EF4444', type: 'expense' },
  { id: 'cat-4', name: 'Entertainment', icon: '🎬', color: '#EC4899', type: 'expense' },
  { id: 'cat-5', name: 'Shopping', icon: '🛍️', color: '#8B5CF6', type: 'expense' },
  { id: 'cat-6', name: 'Healthcare', icon: '🏥', color: '#10B981', type: 'expense' },
  { id: 'cat-7', name: 'Education', icon: '📚', color: '#6366F1', type: 'expense' },
  { id: 'cat-8', name: 'Bills', icon: '💵', color: '#06B6D4', type: 'expense' },
  { id: 'cat-9', name: 'Salary', icon: '💼', color: '#10B981', type: 'income' },
  { id: 'cat-10', name: 'Freelance', icon: '💻', color: '#14B8A6', type: 'income' },
  { id: 'cat-11', name: 'Investment', icon: '📈', color: '#F59E0B', type: 'income' },
  { id: 'cat-12', name: 'Other', icon: '🏷️', color: '#6B7280', type: 'both' }
];

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' }
];

// Seed sample data for first load
export const SAMPLE_DATA = {
  transactions: [
    {
      id: 'tx-1',
      type: 'income',
      amount: 5200,
      category: 'Salary',
      description: 'Monthly salary credit',
      date: '2026-07-01',
      paymentMethod: 'Bank Transfer',
      createdAt: 1782912000000
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 1200,
      category: 'Housing',
      description: 'Apartment rent',
      date: '2026-07-01',
      paymentMethod: 'Bank Transfer',
      createdAt: 1782912100000
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 150,
      category: 'Food',
      description: 'Weekly grocery run',
      date: '2026-07-02',
      paymentMethod: 'Card',
      createdAt: 1782998400000
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 60,
      category: 'Transport',
      description: 'Fuel fill up',
      date: '2026-07-02',
      paymentMethod: 'Card',
      createdAt: 1782998500000
    },
    {
      id: 'tx-5',
      type: 'income',
      amount: 450,
      category: 'Freelance',
      description: 'Web development work',
      date: '2026-07-02',
      paymentMethod: 'UPI',
      createdAt: 1782998600000
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 45,
      category: 'Entertainment',
      description: 'Movie ticket and snacks',
      date: '2026-07-02',
      paymentMethod: 'UPI',
      createdAt: 1782998700000
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 120,
      category: 'Shopping',
      description: 'New summer clothes',
      date: '2026-06-25',
      paymentMethod: 'Card',
      createdAt: 1782393600000
    },
    {
      id: 'tx-8',
      type: 'income',
      amount: 5000,
      category: 'Salary',
      description: 'Monthly salary credit',
      date: '2026-06-01',
      paymentMethod: 'Bank Transfer',
      createdAt: 1780320000000
    },
    {
      id: 'tx-9',
      type: 'expense',
      amount: 1200,
      category: 'Housing',
      description: 'Apartment rent',
      date: '2026-06-01',
      paymentMethod: 'Bank Transfer',
      createdAt: 1780320100000
    },
    {
      id: 'tx-10',
      type: 'expense',
      amount: 320,
      category: 'Bills',
      description: 'Electric bill payment',
      date: '2026-07-01',
      paymentMethod: 'Bank Transfer',
      createdAt: 1782912200000
    }
  ],
  budgets: [
    { id: 'b-1', category: 'Food', limit: 600, month: '2026-07' },
    { id: 'b-2', category: 'Transport', limit: 200, month: '2026-07' },
    { id: 'b-3', category: 'Housing', limit: 1300, month: '2026-07' },
    { id: 'b-4', category: 'Entertainment', limit: 300, month: '2026-07' },
    { id: 'b-5', category: 'Shopping', limit: 400, month: '2026-07' }
  ],
  savingsGoals: [
    {
      id: 'g-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      savedAmount: 4500,
      deadline: '2026-12-31',
      color: '#10B981',
      contributions: [
        { amount: 3000, date: '2026-06-15' },
        { amount: 1500, date: '2026-07-01' }
      ],
      createdAt: 1781520000000
    },
    {
      id: 'g-2',
      name: 'New Gaming PC',
      targetAmount: 2500,
      savedAmount: 1800,
      deadline: '2026-09-30',
      color: '#7C3AED',
      contributions: [
        { amount: 1000, date: '2026-06-20' },
        { amount: 800, date: '2026-07-02' }
      ],
      createdAt: 1781952000000
    }
  ],
  bills: [
    {
      id: 'bl-1',
      name: 'Netflix Premium',
      amount: 15.99,
      dueDate: '2026-07-15',
      recurrence: 'monthly',
      category: 'Entertainment',
      isPaid: false,
      createdAt: 1782912000000
    },
    {
      id: 'bl-2',
      name: 'High Speed Internet',
      amount: 49.99,
      dueDate: '2026-07-05',
      recurrence: 'monthly',
      category: 'Bills',
      isPaid: true,
      createdAt: 1782912000000
    },
    {
      id: 'bl-3',
      name: 'Car Insurance Premium',
      amount: 120.00,
      dueDate: '2026-07-28',
      recurrence: 'monthly',
      category: 'Transport',
      isPaid: false,
      createdAt: 1782912000000
    }
  ]
};
