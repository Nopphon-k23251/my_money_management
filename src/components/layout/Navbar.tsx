import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { AuthModal } from '../common/AuthModal';
import {
  Wallet,
  PlusCircle,
  ArrowLeftRight,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Cloud,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddTransaction: () => void;
  onOpenTransfer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddTransaction, onOpenTransfer }) => {
  const { user, logout, updateUserCurrency, theme, toggleTheme } = useAuth();
  const { isSyncing } = useFinance();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);


  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent truncate block">
                  WealthWise Pro
                </span>
                {user && (
                  <span
                    title={isSyncing ? 'กำลังซิงค์ข้อมูลกับ Cloud...' : 'ข้อมูลซิงค์กับ Cloud แล้ว'}
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin text-emerald-500" />
                    ) : (
                      <Cloud className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span className="hidden xs:inline">{isSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions & Profile */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Quick Transaction Button */}
              <button
                onClick={onOpenAddTransaction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all active:scale-98"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">บันทึกรายการ</span>
              </button>

              {/* Quick Transfer Button */}
              <button
                onClick={onOpenTransfer}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>โอนเงิน</span>
              </button>

              {/* Dark/Light Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="สลับโหมดมืด/สว่าง"
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Currency Selector */}
              <select
                value={user?.currency || 'THB'}
                onChange={(e) => updateUserCurrency(e.target.value)}
                className="px-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="THB">฿ THB</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="JPY">¥ JPY</option>
              </select>

              {/* User Avatar / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800"
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-40 animate-fadeIn">
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

