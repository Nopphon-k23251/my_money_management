import type { Asset, Transaction, Budget } from '../types/finance';


const ASSETS_KEY = 'mm_assets_v1';
const TRANSACTIONS_KEY = 'mm_transactions_v1';
const BUDGETS_KEY = 'mm_budgets_v1';

export const INITIAL_ASSETS: Asset[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: Budget[] = [];


export const storageService = {
  loadAssets(): Asset[] {
    try {
      const data = localStorage.getItem(ASSETS_KEY);
      return data ? JSON.parse(data) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  },

  saveAssets(assets: Asset[]): void {
    try {
      localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    } catch (e) {
      console.error('Failed to save assets:', e);
    }
  },

  loadTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  },

  loadBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(BUDGETS_KEY);
      return data ? JSON.parse(data) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(budgets: Budget[]): void {
    try {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets:', e);
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(BUDGETS_KEY);
  },
};
