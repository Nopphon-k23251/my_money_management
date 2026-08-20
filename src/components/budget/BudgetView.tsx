import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Target, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';

const POPULAR_BUDGET_CATEGORIES = [
  'อาหาร & เครื่องดื่ม (Food & Dining)',
  'ที่อยู่อาศัย (Rent/Housing)',
  'เดินทาง & คมนาคม (Transportation)',
  'ช้อปปิ้ง & ไลฟ์สไตล์ (Shopping)',
  'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต (Utilities)',
  'สุขภาพ & ยา (Healthcare)',
  'บันเทิง & ท่องเที่ยว (Entertainment)',
  'การศึกษา & พัฒนาตนเอง (Education)',
];

import { ConfirmDeleteModal } from '../common/Toast';

export const BudgetView: React.FC = () => {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(POPULAR_BUDGET_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; category: string } | null>(null);


  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Calculate actual spending per category in current month
  const categorySpentMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthKey))
    .forEach((t) => {
      categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + t.amount;
    });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(limitAmount);
    if (isNaN(num) || num <= 0) return;

    if (editingId) {
      updateBudget(editingId, num);
    } else {
      addBudget(selectedCategory, num);
    }

    setIsAddOpen(false);
    setEditingId(null);
    setLimitAmount('');
  };

  const handleStartEdit = (id: string, currentLimit: number, cat: string) => {
    setEditingId(id);
    setSelectedCategory(cat);
    setLimitAmount(String(currentLimit));
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">วางแผน & ควบคุมงบประมาณ (Budgets)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            กำหนดเพดานค่าใช้จ่ายรายหมวดหมู่ประจำเดือน เพื่อควบคุมวินัยทางการเงิน
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setLimitAmount('');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>ตั้งงบประมาณใหม่</span>
        </button>
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">ยังไม่มีการตั้งงบประมาณ</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            กำหนดวงเงินค่าใช้จ่ายรายเดือนในหมวดหมู่สำคัญ เช่น ค่าอาหาร หรือช้อปปิ้ง
          </p>
          <button
            onClick={() => {
              setEditingId(null);
              setLimitAmount('');
              setIsAddOpen(true);
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
          >
            + ตั้งงบประมาณแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {budgets.map((budget) => {
            const spent = categorySpentMap[budget.category] || 0;
            const percentage = Math.min(100, Math.round((spent / budget.limitAmount) * 100));
            const isOver = spent > budget.limitAmount;

            return (
              <div
                key={budget.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors group hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{budget.category}</h3>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        งบประจำเดือน
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(budget.id, budget.limitAmount, budget.category)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="แก้ไขวงเงิน"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: budget.id, category: budget.category })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="ลบงบประมาณ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">ใช้ไปแล้ว</span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(spent, currency)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">วงเงิน</span>
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {formatCurrency(budget.limitAmount, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : percentage >= 85
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">ใช้ไป {percentage}%</span>
                    <span
                      className={`font-semibold text-[11px] ${
                        isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isOver
                        ? `เกินงบ ${formatCurrency(spent - budget.limitAmount, currency)}`
                        : `คงเหลือ ${formatCurrency(budget.limitAmount - spent, currency)}`}
                    </span>
                  </div>
                </div>

                {isOver && (
                  <div className="mt-4 flex items-center gap-1.5 p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/40">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>คำเตือน: คุณใช้จ่ายเกินงบประมาณที่กำหนดไว้แล้ว</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingId ? 'แก้ไขวงเงินงบประมาณ' : 'ตั้งงบประมาณหมวดหมู่ใหม่'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              กำหนดขีดจำกัดยอดใช้จ่ายสูงสุดต่อเดือน
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หมวดหมู่ค่าใช้จ่าย *
                </label>
                <select
                  disabled={Boolean(editingId)}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-60"
                >
                  {POPULAR_BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  วงเงินจำกัดต่อเดือน (บาท) *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="100"
                  required
                  placeholder="เช่น 10000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
                >
                  บันทึกงบประมาณ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteBudget(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="ยืนยันการลบงบประมาณ"
        description="คุณต้องการลบการตั้งค่างบประมาณนี้ใช่หรือไม่? บันทึกรายรับรายจ่ายจะไม่ได้รับผลกระทบ"
        itemDetails={deleteTarget ? `หมวดหมู่: ${deleteTarget.category}` : undefined}
      />
    </div>
  );
};



