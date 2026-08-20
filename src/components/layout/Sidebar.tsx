import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import type { ActiveTab } from '../../types/finance';
import {
  LayoutDashboard,
  Coins,
  ReceiptText,
  PieChart,
  Target,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'ภาพรวม (Dashboard)', icon: LayoutDashboard },
    { id: 'assets', label: 'ทรัพย์สิน (Assets)', icon: Coins },
    { id: 'transactions', label: 'รายรับ-รายจ่าย', icon: ReceiptText },
    { id: 'analytics', label: 'วิเคราะห์การเงิน (Health)', icon: PieChart },
    { id: 'budget', label: 'งบประมาณ (Budgets)', icon: Target },
  ];

  return (
    <>
      {/* Desktop / Tablet Left Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-3.5 gap-1.5 shrink-0 min-h-[calc(100vh-4rem)] transition-colors">
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1">
          เมนูหลัก
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-150 active:scale-[0.99] ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar with Blur */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 px-2 pt-1 pb-safe shadow-lg transition-colors">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-lg transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                }`}
              >
                <div
                  className={`p-1 rounded-md transition-colors ${
                    isActive ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

