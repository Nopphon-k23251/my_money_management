import type { Asset, Transaction, Budget } from '../types/finance';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { unescapeHtml } from '../utils/security';

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

function normalizeAsset(asset: Asset): Asset {
  return {
    ...asset,
    name: unescapeHtml(asset.name),
    bankName: asset.bankName ? unescapeHtml(asset.bankName) : undefined,
    accountNumber: asset.accountNumber ? unescapeHtml(asset.accountNumber) : undefined,
    notes: asset.notes ? unescapeHtml(asset.notes) : undefined,
  };
}

function normalizeTransaction(tx: Transaction): Transaction {
  return {
    ...tx,
    category: unescapeHtml(tx.category),
    description: tx.description ? unescapeHtml(tx.description) : undefined,
  };
}

function normalizeBudget(budget: Budget): Budget {
  return {
    ...budget,
    category: unescapeHtml(budget.category),
  };
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
      if (!data) return INITIAL_ASSETS;
      const parsed: Asset[] = JSON.parse(data);
      return parsed.map(normalizeAsset);
    } catch {
      return INITIAL_ASSETS;
    }
  },

  saveAssets(assets: Asset[], userId?: string): void {
    try {
      const key = this.getStorageKeys(userId).assets;
      const clean = assets.map(normalizeAsset);
      localStorage.setItem(key, JSON.stringify(clean));
      localStorage.setItem(BASE_ASSETS_KEY, JSON.stringify(clean));
    } catch (e) {
      console.error('Failed to save assets:', e);
    }
  },

  loadTransactions(userId?: string): Transaction[] {
    try {
      const key = this.getStorageKeys(userId).transactions;
      const data = localStorage.getItem(key) || localStorage.getItem(BASE_TRANSACTIONS_KEY);
      if (!data) return INITIAL_TRANSACTIONS;
      const parsed: Transaction[] = JSON.parse(data);
      return parsed.map(normalizeTransaction);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[], userId?: string): void {
    try {
      const key = this.getStorageKeys(userId).transactions;
      const clean = transactions.map(normalizeTransaction);
      localStorage.setItem(key, JSON.stringify(clean));
      localStorage.setItem(BASE_TRANSACTIONS_KEY, JSON.stringify(clean));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  },

  loadBudgets(userId?: string): Budget[] {
    try {
      const key = this.getStorageKeys(userId).budgets;
      const data = localStorage.getItem(key) || localStorage.getItem(BASE_BUDGETS_KEY);
      if (!data) return INITIAL_BUDGETS;
      const parsed: Budget[] = JSON.parse(data);
      return parsed.map(normalizeBudget);
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(budgets: Budget[], userId?: string): void {
    try {
      const key = this.getStorageKeys(userId).budgets;
      const clean = budgets.map(normalizeBudget);
      localStorage.setItem(key, JSON.stringify(clean));
      localStorage.setItem(BASE_BUDGETS_KEY, JSON.stringify(clean));
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
      // Deep clone, unescape entities, and remove all `undefined` values to prevent Firestore unsupported field value errors
      const cleanData = JSON.parse(
        JSON.stringify({
          assets: (data.assets || []).map(normalizeAsset),
          transactions: (data.transactions || []).map(normalizeTransaction),
          budgets: (data.budgets || []).map(normalizeBudget),
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
        const rawData = snapshot.data() as UserFinanceData;
        const cleanData: UserFinanceData = {
          assets: (rawData.assets || []).map(normalizeAsset),
          transactions: (rawData.transactions || []).map(normalizeTransaction),
          budgets: (rawData.budgets || []).map(normalizeBudget),
          updatedAt: rawData.updatedAt || new Date().toISOString(),
        };
        console.info('[CloudSync] Loaded existing cloud document for user:', userId, 'Assets:', cleanData.assets.length, 'Tx:', cleanData.transactions.length);
        return cleanData;
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
          const rawData = snapshot.data() as UserFinanceData;
          const cleanData: UserFinanceData = {
            assets: (rawData.assets || []).map(normalizeAsset),
            transactions: (rawData.transactions || []).map(normalizeTransaction),
            budgets: (rawData.budgets || []).map(normalizeBudget),
            updatedAt: rawData.updatedAt || new Date().toISOString(),
          };
          console.info('[CloudSync] Realtime cloud update received for user:', userId, 'Tx:', cleanData.transactions.length);
          onUpdate(cleanData);
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

