import { describe, it, expect } from 'vitest';
import {
  calculateNetWorth,
  evaluateFinancialHealth,
  calculateBalancesOnAdd,
  calculateBalancesOnUpdate,
  calculateBalancesOnDelete,
} from '../utils/financialAnalysis';
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

describe('Transaction Balance Calculation Engine (BugFix & Regression Tests)', () => {
  const createAsset = (id: string, name: string, balance: number): Asset => ({
    id,
    name,
    type: 'bank',
    balance,
    currency: 'THB',
    color: '#2563eb',
    createdAt: '',
    updatedAt: '',
  });

  it('Scenario from User: Asset balance 500 -> add expense 250 -> edit to 255 -> should be 245 (not -5), and confirm without change stays 245 (not -260)', () => {
    let assets = [createAsset('assetA', 'Asset A', 500)];

    // 1. Add expense 250
    const tx1: Transaction = {
      id: 'id01',
      type: 'expense',
      amount: 250,
      date: '2026-08-26',
      category: 'Food',
      fromAssetId: 'assetA',
      createdAt: '',
    };
    assets = calculateBalancesOnAdd(assets, tx1);
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(250);

    // 2. Edit expense from 250 to 255
    assets = calculateBalancesOnUpdate(assets, tx1, { amount: 255 });
    // Expected: 250 (current) + 250 (refund old) - 255 (new) = 245
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(245);

    // 3. Edit expense with no changes (255 -> 255)
    const txUpdated: Transaction = { ...tx1, amount: 255 };
    assets = calculateBalancesOnUpdate(assets, txUpdated, { amount: 255 });
    // Expected: 245 (current) + 255 (refund old) - 255 (new) = 245 (idempotent)
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(245);
  });

  it('should correctly handle changing fromAssetId when editing an expense', () => {
    let assets = [
      createAsset('assetA', 'Asset A', 500),
      createAsset('assetB', 'Asset B', 300),
    ];

    const tx: Transaction = {
      id: 'tx-01',
      type: 'expense',
      amount: 100,
      date: '2026-08-26',
      category: 'Shopping',
      fromAssetId: 'assetA',
      createdAt: '',
    };

    // Add expense to Asset A (500 - 100 = 400)
    assets = calculateBalancesOnAdd(assets, tx);
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(400);
    expect(assets.find((a) => a.id === 'assetB')?.balance).toBe(300);

    // Edit transaction: switch from Asset A to Asset B with new amount 150
    assets = calculateBalancesOnUpdate(assets, tx, { fromAssetId: 'assetB', amount: 150 });
    // Asset A: refunded 100 -> 500
    // Asset B: deducted 150 -> 150
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(500);
    expect(assets.find((a) => a.id === 'assetB')?.balance).toBe(150);
  });

  it('should correctly handle Income addition, edition, and deletion', () => {
    let assets = [createAsset('assetA', 'Asset A', 1000)];

    const txIncome: Transaction = {
      id: 'inc-01',
      type: 'income',
      amount: 500,
      date: '2026-08-26',
      category: 'Salary',
      toAssetId: 'assetA',
      createdAt: '',
    };

    // Add income: 1000 + 500 = 1500
    assets = calculateBalancesOnAdd(assets, txIncome);
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(1500);

    // Edit income: change 500 to 700 -> 1500 - 500 + 700 = 1700
    assets = calculateBalancesOnUpdate(assets, txIncome, { amount: 700 });
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(1700);

    // Delete income: 1700 - 700 = 1000
    const currentIncome: Transaction = { ...txIncome, amount: 700 };
    assets = calculateBalancesOnDelete(assets, currentIncome);
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(1000);
  });

  it('should correctly handle Transfer addition, edition, and deletion', () => {
    let assets = [
      createAsset('assetA', 'Asset A', 1000),
      createAsset('assetB', 'Asset B', 500),
    ];

    const txTransfer: Transaction = {
      id: 'tr-01',
      type: 'transfer',
      amount: 200,
      date: '2026-08-26',
      category: 'Transfer',
      fromAssetId: 'assetA',
      toAssetId: 'assetB',
      createdAt: '',
    };

    // Add transfer: A = 800, B = 700
    assets = calculateBalancesOnAdd(assets, txTransfer);
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(800);
    expect(assets.find((a) => a.id === 'assetB')?.balance).toBe(700);

    // Edit transfer amount to 300: A = 800 + 200 - 300 = 700, B = 700 - 200 + 300 = 800
    assets = calculateBalancesOnUpdate(assets, txTransfer, { amount: 300 });
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(700);
    expect(assets.find((a) => a.id === 'assetB')?.balance).toBe(800);

    // Delete transfer: A = 700 + 300 = 1000, B = 800 - 300 = 500
    const currentTransfer: Transaction = { ...txTransfer, amount: 300 };
    assets = calculateBalancesOnDelete(assets, currentTransfer);
    expect(assets.find((a) => a.id === 'assetA')?.balance).toBe(1000);
    expect(assets.find((a) => a.id === 'assetB')?.balance).toBe(500);
  });
});

