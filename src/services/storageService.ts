import type { Asset, Transaction, Budget } from '../types/finance';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const ASSETS_KEY = 'mm_assets_v1';
const TRANSACTIONS_KEY = 'mm_transactions_v1';
const BUDGETS_KEY = 'mm_budgets_v1';

export const INITIAL_ASSETS: Asset[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BUDGETS: Budget[] = [];

export interface UserFinanceData {
  assets: Asset[];
  transactions: Transaction[];
  budgets: Budget[];
  updatedAt: string;
}

export const storageService = {
  // --- LocalStorage (Fast & Offline) ---
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

  // --- Cloud Firestore Sync (Multi-Device Realtime Synchronization) ---
  async syncToCloud(userId: string, data: { assets: Asset[]; transactions: Transaction[]; budgets: Budget[] }): Promise<void> {
    if (!db || !userId) return;
    try {
      const userDocRef = doc(db, 'users_finance', userId);
      await setDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Cloud sync error (will keep in localStorage):', err);
    }
  },

  async loadFromCloud(userId: string): Promise<UserFinanceData | null> {
    if (!db || !userId) return null;
    try {
      const userDocRef = doc(db, 'users_finance', userId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserFinanceData;
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch from Cloud Firestore:', err);
      return null;
    }
  },

  subscribeToCloud(
    userId: string,
    onUpdate: (data: UserFinanceData) => void
  ): () => void {
    if (!db || !userId) return () => {};
    const userDocRef = doc(db, 'users_finance', userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as UserFinanceData;
          onUpdate(cloudData);
        }
      },
      (error) => {
        console.warn('Firestore realtime subscription error:', error);
      }
    );
    return unsubscribe;
  },

  resetToDefault(): void {
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(BUDGETS_KEY);
  },
};

