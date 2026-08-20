import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const StatCards: React.FC = () => {
  const { netWorthData, transactions } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonthPrefix)
  );

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = monthlyIncome - monthlyExpense;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Net Worth Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-950 rounded-xl p-4 sm:p-5 text-white shadow-sm flex flex-col justify-between relative overflow-hidden border border-indigo-700/40">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
              ความมั่งคั่งสุทธิ (Net Worth)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-700/60 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-indigo-200" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight">
            {formatCurrency(netWorthData.netWorth, currency)}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-indigo-700/50 flex items-center justify-between text-xs text-indigo-200">
          <span>สินทรัพย์: {formatCurrency(netWorthData.totalAssets, currency)}</span>
          {netWorthData.totalDebts > 0 && (
            <span className="text-rose-300 font-semibold">หนี้: {formatCurrency(netWorthData.totalDebts, currency)}</span>
          )}
        </div>
      </div>

      {/* 2. Monthly Income Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              รายรับเดือนนี้
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(monthlyIncome, currency)}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>รายรับเข้าสู่ระบบ</span>
        </div>
      </div>

      {/* 3. Monthly Expense Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              รายจ่ายเดือนนี้
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(monthlyExpense, currency)}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>ค่าใช้จ่ายประจำเดือน</span>
        </div>
      </div>

      {/* 4. Net Savings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              เงินออมสุทธิเดือนนี้
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                netSavings >= 0
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              netSavings >= 0
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(netSavings, currency)}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>อัตราการออม: {monthlyIncome > 0 ? Math.max(0, Math.round((netSavings / monthlyIncome) * 100)) : 0}%</span>
        </div>
      </div>
    </div>
  );
};

