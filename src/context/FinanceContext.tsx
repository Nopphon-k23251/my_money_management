import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Asset, Transaction, Budget, FinancialHealthScore, ActiveTab } from '../types/finance';
import { useAuth } from './AuthContext';
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
  isSyncing: boolean;
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
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(() => storageService.loadAssets(user?.id));
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.loadTransactions(user?.id));
  const [budgets, setBudgets] = useState<Budget[]>(() => storageService.loadBudgets(user?.id));
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isCloudUpdateRef = useRef(false);

  // Live state refs to prevent stale closure bugs during concurrent state updates
  const assetsRef = useRef<Asset[]>(assets);
  const transactionsRef = useRef<Transaction[]>(transactions);
  const budgetsRef = useRef<Budget[]>(budgets);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);

  useEffect(() => {
    budgetsRef.current = budgets;
  }, [budgets]);

  const healthScore = evaluateFinancialHealth(assets, transactions);
  const netWorthData = calculateNetWorth(assets);

  // Helper to persist locally and sync to Cloud immediately
  const persistAndSync = (
    newAssets?: Asset[],
    newTx?: Transaction[],
    newBudgets?: Budget[]
  ) => {
    const nextAssets = newAssets ?? assetsRef.current;
    const nextTx = newTx ?? transactionsRef.current;
    const nextBudgets = newBudgets ?? budgetsRef.current;

    storageService.saveAssets(nextAssets, user?.id);
    storageService.saveTransactions(nextTx, user?.id);
    storageService.saveBudgets(nextBudgets, user?.id);

    if (user && !user.isDemoUser && !isCloudUpdateRef.current) {
      storageService.syncToCloud(user.id, {
        assets: nextAssets,
        transactions: nextTx,
        budgets: nextBudgets,
      });
    }
  };

  // Subscribe to Cloud Firestore when a user is logged in
  useEffect(() => {
    if (!user || user.isDemoUser) {
      return;
    }

    setIsSyncing(true);

    // Initial fetch from Cloud
    storageService.loadFromCloud(user.id).then((cloudData) => {
      if (cloudData && (cloudData.assets?.length || cloudData.transactions?.length || cloudData.budgets?.length)) {
        // Cloud has existing data -> adopt cloud data as source of truth
        isCloudUpdateRef.current = true;
        const validAssets = cloudData.assets || [];
        const validTx = cloudData.transactions || [];
        const validBudgets = cloudData.budgets || [];

        setAssets(validAssets);
        setTransactions(validTx);
        setBudgets(validBudgets);
        assetsRef.current = validAssets;
        transactionsRef.current = validTx;
        budgetsRef.current = validBudgets;

        storageService.saveAssets(validAssets, user.id);
        storageService.saveTransactions(validTx, user.id);
        storageService.saveBudgets(validBudgets, user.id);
      } else {
        // Cloud is empty -> migrate current local data to cloud
        const currentLocalAssets = storageService.loadAssets(user.id);
        const currentLocalTx = storageService.loadTransactions(user.id);
        const currentLocalBudgets = storageService.loadBudgets(user.id);
        if (currentLocalAssets.length > 0 || currentLocalTx.length > 0 || currentLocalBudgets.length > 0) {
          storageService.syncToCloud(user.id, {
            assets: currentLocalAssets,
            transactions: currentLocalTx,
            budgets: currentLocalBudgets,
          });
        }
      }
      setIsSyncing(false);
    });

    // Realtime Listener across devices
    const unsubscribe = storageService.subscribeToCloud(user.id, (cloudData) => {
      isCloudUpdateRef.current = true;
      if (cloudData.assets) {
        setAssets(cloudData.assets);
        assetsRef.current = cloudData.assets;
        storageService.saveAssets(cloudData.assets, user.id);
      }
      if (cloudData.transactions) {
        setTransactions(cloudData.transactions);
        transactionsRef.current = cloudData.transactions;
        storageService.saveTransactions(cloudData.transactions, user.id);
      }
      if (cloudData.budgets) {
        setBudgets(cloudData.budgets);
        budgetsRef.current = cloudData.budgets;
        storageService.saveBudgets(cloudData.budgets, user.id);
      }
      setTimeout(() => {
        isCloudUpdateRef.current = false;
      }, 150);
    });

    return () => unsubscribe();
  }, [user?.id]);

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
    const nextAssets = [newAsset, ...assetsRef.current];
    assetsRef.current = nextAssets;
    setAssets(nextAssets);
    persistAndSync(nextAssets, transactionsRef.current, budgetsRef.current);
  };

  const updateAsset = (id: string, data: Partial<Asset>) => {
    const nextAssets = assetsRef.current.map((a) =>
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
    );
    assetsRef.current = nextAssets;
    setAssets(nextAssets);
    persistAndSync(nextAssets, transactionsRef.current, budgetsRef.current);
  };

  const deleteAsset = (id: string) => {
    const nextAssets = assetsRef.current.filter((a) => a.id !== id);
    assetsRef.current = nextAssets;
    setAssets(nextAssets);
    persistAndSync(nextAssets, transactionsRef.current, budgetsRef.current);
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
    const nextAssets = assetsRef.current.map((asset) => {
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
    });

    const nextTx = [newTx, ...transactionsRef.current];
    assetsRef.current = nextAssets;
    transactionsRef.current = nextTx;
    setAssets(nextAssets);
    setTransactions(nextTx);
    persistAndSync(nextAssets, nextTx, budgetsRef.current);
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const oldTx = transactionsRef.current.find((t) => t.id === id);
    if (!oldTx) return;

    // Revert old transaction impact and apply new
    const nextAssets = assetsRef.current.map((asset) => {
      let bal = asset.balance;
      if (oldTx.type === 'income' && oldTx.toAssetId === asset.id) bal -= oldTx.amount;
      if (oldTx.type === 'expense' && oldTx.fromAssetId === asset.id) bal -= oldTx.amount;
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
    });

    const nextTx = transactionsRef.current.map((t) =>
      t.id === id
        ? {
            ...t,
            ...data,
            category: data.category ? sanitizeInput(data.category) : t.category,
            description: data.description ? sanitizeInput(data.description) : t.description,
          }
        : t
    );

    assetsRef.current = nextAssets;
    transactionsRef.current = nextTx;
    setAssets(nextAssets);
    setTransactions(nextTx);
    persistAndSync(nextAssets, nextTx, budgetsRef.current);
  };

  const deleteTransaction = (id: string) => {
    const tx = transactionsRef.current.find((t) => t.id === id);
    if (!tx) return;

    // Revert balance
    const nextAssets = assetsRef.current.map((asset) => {
      let bal = asset.balance;
      if (tx.type === 'income' && tx.toAssetId === asset.id) bal -= tx.amount;
      if (tx.type === 'expense' && tx.fromAssetId === asset.id) bal += tx.amount;
      if (tx.type === 'transfer') {
        if (tx.fromAssetId === asset.id) bal += tx.amount;
        if (tx.toAssetId === asset.id) bal -= tx.amount;
      }
      return { ...asset, balance: bal, updatedAt: new Date().toISOString() };
    });

    const nextTx = transactionsRef.current.filter((t) => t.id !== id);
    assetsRef.current = nextAssets;
    transactionsRef.current = nextTx;
    setAssets(nextAssets);
    setTransactions(nextTx);
    persistAndSync(nextAssets, nextTx, budgetsRef.current);
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
    const nextBudgets: Budget[] = [
      ...budgetsRef.current,
      {
        id: 'b-' + Date.now(),
        category: sanitizeInput(category),
        limitAmount,
        period: 'monthly',
      },
    ];
    budgetsRef.current = nextBudgets;
    setBudgets(nextBudgets);
    persistAndSync(assetsRef.current, transactionsRef.current, nextBudgets);
  };

  const updateBudget = (id: string, limitAmount: number) => {
    const nextBudgets = budgetsRef.current.map((b) => (b.id === id ? { ...b, limitAmount } : b));
    budgetsRef.current = nextBudgets;
    setBudgets(nextBudgets);
    persistAndSync(assetsRef.current, transactionsRef.current, nextBudgets);
  };

  const deleteBudget = (id: string) => {
    const nextBudgets = budgetsRef.current.filter((b) => b.id !== id);
    budgetsRef.current = nextBudgets;
    setBudgets(nextBudgets);
    persistAndSync(assetsRef.current, transactionsRef.current, nextBudgets);
  };

  const resetData = () => {
    storageService.resetToDefault(user?.id);
    setAssets(storageService.loadAssets(user?.id));
    setTransactions(storageService.loadTransactions(user?.id));
    setBudgets(storageService.loadBudgets(user?.id));
    assetsRef.current = [];
    transactionsRef.current = [];
    budgetsRef.current = [];
    if (user && !user.isDemoUser) {
      storageService.syncToCloud(user.id, { assets: [], transactions: [], budgets: [] });
    }
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
        isSyncing,
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
