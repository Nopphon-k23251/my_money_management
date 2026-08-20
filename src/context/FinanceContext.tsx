import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Asset, Transaction, Budget, FinancialHealthScore, ActiveTab } from '../types/finance';

import { storageService } from '../services/storageService';
import { evaluateFinancialHealth, calculateNetWorth } from '../utils/financialAnalysis';
import { sanitizeInput } from '../utils/security';

interface FinanceContextType {
  assets: Asset[];
  transactions: Transaction[];
  budgets: Budget[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  healthScore: FinancialHealthScore;
  netWorthData: { totalAssets: number; totalDebts: number; netWorth: number };
  // Asset actions
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  // Transfer action
  transferFunds: (fromAssetId: string, toAssetId: string, amount: number, note?: string) => void;
  // Budget actions
  updateBudget: (id: string, limitAmount: number) => void;
  addBudget: (category: string, limitAmount: number) => void;
  deleteBudget: (id: string) => void;
  // Reset
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>(() => storageService.loadAssets());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.loadTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => storageService.loadBudgets());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  useEffect(() => {
    storageService.saveAssets(assets);
  }, [assets]);

  useEffect(() => {
    storageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    storageService.saveBudgets(budgets);
  }, [budgets]);

  const healthScore = evaluateFinancialHealth(assets, transactions);
  const netWorthData = calculateNetWorth(assets);

  // Asset Handlers
  const addAsset = (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: Asset = {
      ...assetData,
      id: 'asset-' + Date.now(),
      name: sanitizeInput(assetData.name),
      bankName: sanitizeInput(assetData.bankName),
      accountNumber: sanitizeInput(assetData.accountNumber),
      notes: sanitizeInput(assetData.notes),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  const updateAsset = (id: string, data: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              ...data,
              name: data.name ? sanitizeInput(data.name) : a.name,
              bankName: data.bankName ? sanitizeInput(data.bankName) : a.bankName,
              accountNumber: data.accountNumber ? sanitizeInput(data.accountNumber) : a.accountNumber,
              notes: data.notes ? sanitizeInput(data.notes) : a.notes,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Transaction Handlers (with auto-balance sync)
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      category: sanitizeInput(txData.category),
      description: sanitizeInput(txData.description),
      createdAt: new Date().toISOString(),
    };

    // Update asset balances accordingly
    setAssets((prev) =>
      prev.map((asset) => {
        let newBalance = asset.balance;
        if (newTx.type === 'income' && newTx.toAssetId === asset.id) {
          newBalance += newTx.amount;
        } else if (newTx.type === 'expense' && newTx.fromAssetId === asset.id) {
          newBalance -= newTx.amount;
        } else if (newTx.type === 'transfer') {
          if (newTx.fromAssetId === asset.id) newBalance -= newTx.amount;
          if (newTx.toAssetId === asset.id) newBalance += newTx.amount;
        }
        return { ...asset, balance: newBalance, updatedAt: new Date().toISOString() };
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    // Revert old transaction impact
    setAssets((prev) =>
      prev.map((asset) => {
        let bal = asset.balance;
        if (oldTx.type === 'income' && oldTx.toAssetId === asset.id) bal -= oldTx.amount;
        if (oldTx.type === 'expense' && oldTx.fromAssetId === asset.id) bal += oldTx.amount;
        if (oldTx.type === 'transfer') {
          if (oldTx.fromAssetId === asset.id) bal += oldTx.amount;
          if (oldTx.toAssetId === asset.id) bal -= oldTx.amount;
        }

        const merged: Transaction = { ...oldTx, ...data };
        if (merged.type === 'income' && merged.toAssetId === asset.id) bal += merged.amount;
        if (merged.type === 'expense' && merged.fromAssetId === asset.id) bal -= merged.amount;
        if (merged.type === 'transfer') {
          if (merged.fromAssetId === asset.id) bal -= merged.amount;
          if (merged.toAssetId === asset.id) bal += merged.amount;
        }

        return { ...asset, balance: bal, updatedAt: new Date().toISOString() };
      })
    );

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...data,
              category: data.category ? sanitizeInput(data.category) : t.category,
              description: data.description ? sanitizeInput(data.description) : t.description,
            }
          : t
      )
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Revert balance
    setAssets((prev) =>
      prev.map((asset) => {
        let bal = asset.balance;
        if (tx.type === 'income' && tx.toAssetId === asset.id) bal -= tx.amount;
        if (tx.type === 'expense' && tx.fromAssetId === asset.id) bal += tx.amount;
        if (tx.type === 'transfer') {
          if (tx.fromAssetId === asset.id) bal += tx.amount;
          if (tx.toAssetId === asset.id) bal -= tx.amount;
        }
        return { ...asset, balance: bal, updatedAt: new Date().toISOString() };
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const transferFunds = (fromAssetId: string, toAssetId: string, amount: number, note?: string) => {
    addTransaction({
      type: 'transfer',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'โอนย้ายเงินระหว่างบัญชี',
      fromAssetId,
      toAssetId,
      description: note || 'โอนย้ายเงินภายใน',
      tags: ['transfer'],
    });
  };

  // Budget Handlers
  const addBudget = (category: string, limitAmount: number) => {
    setBudgets((prev) => [
      ...prev,
      {
        id: 'b-' + Date.now(),
        category: sanitizeInput(category),
        limitAmount,
        period: 'monthly',
      },
    ]);
  };

  const updateBudget = (id: string, limitAmount: number) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, limitAmount } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const resetData = () => {
    storageService.resetToDefault();
    setAssets(storageService.loadAssets());
    setTransactions(storageService.loadTransactions());
    setBudgets(storageService.loadBudgets());
  };

  return (
    <FinanceContext.Provider
      value={{
        assets,
        transactions,
        budgets,
        activeTab,
        setActiveTab,
        healthScore,
        netWorthData,
        addAsset,
        updateAsset,
        deleteAsset,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        transferFunds,
        addBudget,
        updateBudget,
        deleteBudget,
        resetData,
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
