import React from 'react';
import { StatCards } from './StatCards';
import { FinancialScoreWidget } from './FinancialScoreWidget';
import { CashFlowChart } from './CashFlowChart';
import { RecentTransactions } from './RecentTransactions';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Wallet,
  Landmark,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddAsset: () => void;
  onOpenAddTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddAsset,
  onOpenAddTransaction,
}) => {
  const { assets, setActiveTab } = useFinance();
  const { user } = useAuth();

  const currency = user?.currency || 'THB';

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return Wallet;
      case 'bank':
        return Landmark;
      case 'investment':
      case 'crypto':
        return TrendingUp;
      case 'credit':
        return CreditCard;
      default:
        return Wallet;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-12">
      {/* Quick Action Bar on top of dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            ภาพรวมการเงิน (Financial Overview)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            สรุปความมั่งคั่ง กระแสเงินสด และสุขภาพทางการเงินของคุณ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddAsset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบัญชี</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายการ</span>
          </button>
        </div>
      </div>

      {/* 1. Stat Cards Overview */}
      <StatCards />

      {/* 2. Middle Row: CashFlow Chart & Financial Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-1">
          <FinancialScoreWidget />
        </div>
      </div>

      {/* 3. Bottom Row: Quick Assets List & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Assets Mini Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">ทรัพย์สินและบัญชี</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  รวม {assets.length} บัญชี
                </p>
              </div>
              <button
                onClick={onOpenAddAsset}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                <Wallet className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">ยังไม่มีบัญชีหรือกระเป๋าเงิน</p>
                <p className="text-[11px] text-slate-400 mt-0.5">กดปุ่ม "เพิ่ม" ด้านบนเพื่อเริ่มสร้างบัญชีแรก</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assets.slice(0, 4).map((asset) => {
                  const Icon = getAssetIcon(asset.type);
                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: asset.color || '#6366f1' }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{asset.name}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {asset.bankName || (asset.type === 'cash' ? 'เงินสด' : asset.type)}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-bold ${
                          asset.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatCurrency(asset.balance, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('assets')}
            className="w-full mt-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/50 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>ดูบัญชีทั้งหมด ({assets.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Transactions Mini View */}
        <RecentTransactions />
      </div>
    </div>
  );
};


