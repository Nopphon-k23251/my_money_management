import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import type { Transaction } from '../../types/finance';

import { formatCurrency, formatDate } from '../../utils/formatters';
import { TransactionModal } from './TransactionModal';
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Search,
  Plus,
  Pencil,
  Trash2,
  Download,
} from 'lucide-react';

import { ConfirmDeleteModal } from '../common/Toast';

export const TransactionsView: React.FC = () => {
  const { transactions, assets, addTransaction, updateTransaction, deleteTransaction } =
    useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; cat: string; amount: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Available categories in current transactions
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const getAssetName = (id?: string) => {
    if (!id) return '';
    const a = assets.find((asset) => asset.id === id);
    return a ? a.name : 'บัญชี';
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchDesc = tx.description?.toLowerCase().includes(q);
      const matchTags = tx.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchCat && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, cat: string, amount: number) => {
    setDeleteTarget({ id, cat, amount });
  };


  const handleSave = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      updateTransaction(editingTx.id, txData);
    } else {
      addTransaction(txData);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description', 'Tags'];
    
    // Prevent CSV formula injection (neutralize =, +, -, @)
    const sanitizeCsvCell = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      let str = String(val);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredTransactions.map((t) => [
      sanitizeCsvCell(t.id),
      sanitizeCsvCell(t.date),
      sanitizeCsvCell(t.type),
      sanitizeCsvCell(t.category),
      t.amount,
      sanitizeCsvCell(t.description || ''),
      sanitizeCsvCell((t.tags || []).join(',')),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `money_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-12">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">ประวัติบันทึกรายรับ-รายจ่าย</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ทั้งหมด {transactions.length} รายการ (ตรงตามตัวกรอง {filteredTransactions.length} รายการ)
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {transactions.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">ส่งออก CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingTx(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายการใหม่</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between transition-colors">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาหมวดหมู่, รายละเอียด, แท็ก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter & Category Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold overflow-x-auto justify-between sm:justify-start">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'income', label: 'รายรับ' },
                { id: 'expense', label: 'รายจ่าย' },
                { id: 'transfer', label: 'โอนเงิน' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`px-2.5 sm:px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                    filterType === t.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="ตัวกรองหมวดหมู่"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Transactions Table / Card List or Clean Empty Prompt */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {transactions.length === 0 ? 'ยังไม่มีประวัติการทำรายการ' : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {transactions.length === 0 ? 'บันทึกรายรับหรือรายจ่ายรายการแรกเพื่อเริ่มติดตามพฤติกรรมการใช้จ่าย' : 'ลองค้นหาด้วยคำอื่น หรือปรับตัวกรอง'}
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => {
                  setEditingTx(null);
                  setIsModalOpen(true);
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
              >
                + บันทึกรายการใหม่
              </button>
            )}
          </div>
        ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 sm:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
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
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white break-words">
                        {tx.category}
                      </span>
                      {tx.tags &&
                        tx.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 flex flex-wrap items-center gap-1.5 mt-1">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {tx.type === 'transfer'
                          ? `${getAssetName(tx.fromAssetId)} ➔ ${getAssetName(tx.toAssetId)}`
                          : tx.type === 'income'
                          ? getAssetName(tx.toAssetId)
                          : getAssetName(tx.fromAssetId)}
                      </span>
                      {tx.description && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 dark:text-slate-400 italic break-words">
                            {tx.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0">
                  <div
                    className={`text-sm sm:text-base font-black ${
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

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                      title="แก้ไข"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id, tx.category, tx.amount)}
                      className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSave}
        initialTx={editingTx}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTransaction(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="ยืนยันการลบรายการ"
        description="คุณต้องการลบรายการบันทึกนี้ใช่หรือไม่? การกระทำนี้จะอัปเดตยอดเงินคงเหลือของบัญชีที่เกี่ยวข้องโดยอัตโนมัติ"
        itemDetails={
          deleteTarget
            ? `${deleteTarget.cat} • ${formatCurrency(deleteTarget.amount, currency)}`
            : undefined
        }
      />
    </div>
  );
};


