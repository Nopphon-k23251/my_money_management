import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, ChevronRight } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { transactions, assets, setActiveTab } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  const recent = transactions.slice(0, 5);

  const getAssetName = (id?: string) => {
    if (!id) return '';
    const a = assets.find((asset) => asset.id === id);
    return a ? a.name : 'บัญชี';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">รายการบันทึกล่าสุด</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">5 รายการล่าสุดที่คุณทำรายการ</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-0.5"
          >
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">ยังไม่มีรายการบันทึก</p>
            <p className="text-[11px] text-slate-400 mt-0.5">กดปุ่ม "บันทึกรายการ" เพื่อเพิ่มรายรับหรือรายจ่าย</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((tx) => (
              <div
                key={tx.id}
                className="p-3 sm:px-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-2.5 sm:gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'expense'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {tx.type === 'income' && <ArrowUpRight className="w-4 h-4" />}
                    {tx.type === 'expense' && <ArrowDownRight className="w-4 h-4" />}
                    {tx.type === 'transfer' && <ArrowLeftRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tx.category}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">
                        {tx.type === 'transfer'
                          ? `${getAssetName(tx.fromAssetId)} ➔ ${getAssetName(tx.toAssetId)}`
                          : tx.type === 'income'
                          ? getAssetName(tx.toAssetId)
                          : getAssetName(tx.fromAssetId)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs sm:text-sm font-black shrink-0 ${
                    tx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : tx.type === 'expense'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                  {formatCurrency(tx.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

