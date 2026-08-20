import type { Asset, Transaction, Budget } from '../types/finance';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const BASE_ASSETS_KEY = 'mm_assets_v1';
const BASE_TRANSACTIONS_KEY = 'mm_transactions_v1';
const BASE_BUDGETS_KEY = 'mm_budgets_v1';

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
  getStorageKeys(userId?: string) {
    const prefix = userId ? `mm_${userId}` : 'mm_guest';
    return {
      assets: `${prefix}_assets_v1`,
      transactions: `${prefix}_transactions_v1`,
      budgets: `${prefix}_budgets_v1`,
    };
  },

  // --- LocalStorage (Fast & Offline) ---
  loadAssets(userId?: string): Asset[] {
    try {
      const key = this.getStorageKeys(userId).assets;
      const data = localStorage.getItem(key) || localStorage.getItem(BASE_ASSETS_KEY);
      return data ? JSON.parse(data) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  },

  saveAssets(assets: Asset[], userId?: string): void {
    try {
      const key = this.getStorageKeys(userId).assets;
      localStorage.setItem(key, JSON.stringify(assets));
      localStorage.setItem(BASE_ASSETS_KEY, JSON.stringify(assets));
    } catch (e) {
      console.error('Failed to save assets:', e);
    }
  },

  loadTransactions(userId?: string): Transaction[] {
    try {
      const key = this.getStorageKeys(userId).transactions;
      const data = localStorage.getItem(key) || localStorage.getItem(BASE_TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[], userId?: string): void {
    try {
      const key = this.getStorageKeys(userId).transactions;
      localStorage.setItem(key, JSON.stringify(transactions));
      localStorage.setItem(BASE_TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  },

  loadBudgets(userId?: string): Budget[] {
    try {
      const key = this.getStorageKeys(userId).budgets;
      const data = localStorage.getItem(key) || localStorage.getItem(BASE_BUDGETS_KEY);
      return data ? JSON.parse(data) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(budgets: Budget[], userId?: string): void {
    try {
      const key = this.getStorageKeys(userId).budgets;
      localStorage.setItem(key, JSON.stringify(budgets));
      localStorage.setItem(BASE_BUDGETS_KEY, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets:', e);
    }
  },

  // --- Cloud Firestore Sync (Multi-Device Realtime Synchronization) ---
  async syncToCloud(userId: string, data: { assets: Asset[]; transactions: Transaction[]; budgets: Budget[] }): Promise<boolean> {
    if (!db || !userId) {
      console.warn('[CloudSync] Skipped: db or userId missing', { db: Boolean(db), userId });
      return false;
    }
    try {
      // Deep clone and remove all `undefined` values to prevent Firestore unsupported field value errors
      const cleanData = JSON.parse(
        JSON.stringify({
          assets: data.assets || [],
          transactions: data.transactions || [],
          budgets: data.budgets || [],
          updatedAt: new Date().toISOString(),
        })
      );
      const userDocRef = doc(db, 'users_finance', userId);
      await setDoc(userDocRef, cleanData);
      console.info('[CloudSync] Successfully saved to Firestore for user:', userId, 'Assets:', cleanData.assets.length, 'Tx:', cleanData.transactions.length);
      return true;
    } catch (err) {
      console.error('[CloudSync] Fatal error saving to Cloud Firestore:', err);
      return false;
    }
  },

  async loadFromCloud(userId: string): Promise<UserFinanceData | null> {
    if (!db || !userId) {
      console.warn('[CloudSync] Load skipped: db or userId missing');
      return null;
    }
    try {
      const userDocRef = doc(db, 'users_finance', userId);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as UserFinanceData;
        console.info('[CloudSync] Loaded existing cloud document for user:', userId, 'Assets:', data.assets?.length, 'Tx:', data.transactions?.length);
        return data;
      }
      console.info('[CloudSync] No cloud document found for user yet:', userId);
      return null;
    } catch (err) {
      console.error('[CloudSync] Failed to fetch from Cloud Firestore:', err);
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
          console.info('[CloudSync] Realtime cloud update received for user:', userId, 'Tx:', cloudData.transactions?.length);
          onUpdate(cloudData);
        }
      },
      (error) => {
        console.error('[CloudSync] Firestore realtime subscription error:', error);
      }
    );
    return unsubscribe;
  },

  resetToDefault(userId?: string): void {
    const keys = this.getStorageKeys(userId);
    localStorage.removeItem(keys.assets);
    localStorage.removeItem(keys.transactions);
    localStorage.removeItem(keys.budgets);
    localStorage.removeItem(BASE_ASSETS_KEY);
    localStorage.removeItem(BASE_TRANSACTIONS_KEY);
    localStorage.removeItem(BASE_BUDGETS_KEY);
  },
};

