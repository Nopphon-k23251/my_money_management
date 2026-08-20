import { describe, it, expect } from 'vitest';
import { calculateNetWorth, evaluateFinancialHealth } from '../utils/financialAnalysis';
import type { Asset, Transaction } from '../types/finance';


describe('Financial Analysis Engine', () => {
  const mockAssets: Asset[] = [
    {
      id: '1',
      name: 'Cash',
      type: 'cash',
      balance: 10000,
      currency: 'THB',
      color: '#10b981',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '2',
      name: 'Bank',
      type: 'bank',
      balance: 90000,
      currency: 'THB',
      color: '#059669',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '3',
      name: 'Credit Debt',
      type: 'credit',
      balance: -20000,
      currency: 'THB',
      color: '#e11d48',
      createdAt: '',
      updatedAt: '',
    },
  ];

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const mockTransactions: Transaction[] = [
    {
      id: 't1',
      type: 'income',
      amount: 50000,
      date: `${currentMonth}-01`,
      category: 'Salary',
      createdAt: '',
    },
    {
      id: 't2',
      type: 'expense',
      amount: 25000,
      date: `${currentMonth}-05`,
      category: 'Food & Housing',
      createdAt: '',
    },
  ];

  it('should calculate Net Worth correctly (Assets - Debts)', () => {
    const res = calculateNetWorth(mockAssets);
    expect(res.totalAssets).toBe(100000);
    expect(res.totalDebts).toBe(20000);
    expect(res.netWorth).toBe(80000);
  });

  it('should compute Emergency Fund months and savings rate', () => {
    const health = evaluateFinancialHealth(mockAssets, mockTransactions);
    // Liquid assets = 10000 + 90000 = 100,000. Monthly expense = 25,000 => 4 months
    expect(health.emergencyFundMonths).toBe(4);
    expect(health.emergencyFundStatus).toBe('good');
    // Savings = (50,000 - 25,000) / 50,000 = 50%
    expect(health.savingsRatePercentage).toBe(50);
    expect(health.savingsRateStatus).toBe('exceptional');
    expect(health.grade).toBe('A');
  });
});
