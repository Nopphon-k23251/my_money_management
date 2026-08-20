export type AssetType = 'cash' | 'bank' | 'investment' | 'crypto' | 'credit' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency: string;
  accountNumber?: string;
  bankName?: string;
  color: string;
  icon?: string;
  notes?: string;
  isExcludedFromNetWorth?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  fromAssetId?: string; // for expense and transfer
  toAssetId?: string;   // for income and transfer
  description?: string;
  tags?: string[];
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  period: 'monthly' | 'yearly';
}

export interface FinancialHealthScore {
  overallScore: number; // 0 - 100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  emergencyFundMonths: number;
  emergencyFundStatus: 'danger' | 'warning' | 'good' | 'excellent';
  savingsRatePercentage: number;
  savingsRateStatus: 'low' | 'moderate' | 'healthy' | 'exceptional';
  debtToIncomeRatio: number;
  debtStatus: 'low' | 'manageable' | 'high' | 'critical';
  recommendations: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currency: string; // e.g. THB, USD
  theme: 'light' | 'dark' | 'system';
  isDemoUser?: boolean;
}

export type ActiveTab = 'dashboard' | 'assets' | 'transactions' | 'analytics' | 'budget';
