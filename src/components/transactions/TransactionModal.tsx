import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Transaction, TransactionType } from '../../types/finance';

import { useFinance } from '../../context/FinanceContext';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialTx?: Transaction | null;
}

const INCOME_CATEGORIES = [
  'เงินเดือน (Salary)',
  'งานฟรีแลนซ์ (Freelance)',
  'เงินปันผล & ดอกเบี้ย (Dividends/Interest)',
  'ธุรกิจส่วนตัว (Business)',
  'โบนัส (Bonus)',
  'รายรับอื่นๆ (Other Income)',
];

const EXPENSE_CATEGORIES = [
  'อาหาร & เครื่องดื่ม (Food & Dining)',
  'ที่อยู่อาศัย (Rent/Housing)',
  'เดินทาง & คมนาคม (Transportation)',
  'ช้อปปิ้ง & ไลฟ์สไตล์ (Shopping)',
  'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต (Utilities)',
  'สุขภาพ & ยา (Healthcare)',
  'บันเทิง & ท่องเที่ยว (Entertainment)',
  'การศึกษา & พัฒนาตนเอง (Education)',
  'ชำระหนี้สิน / ผ่อนชำระ (Debt Payments)',
  'รายจ่ายอื่นๆ (Other Expense)',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTx,
}) => {
  const { assets } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTx) {
      setType(initialTx.type);
      setAmount(String(initialTx.amount));
      setDate(initialTx.date);
      setCategory(initialTx.category);
      setAssetId(initialTx.type === 'income' ? initialTx.toAssetId || '' : initialTx.fromAssetId || '');
      setDescription(initialTx.description || '');
      setTagsInput(initialTx.tags ? initialTx.tags.join(', ') : '');
    } else {
      setType('expense');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(EXPENSE_CATEGORIES[0]);
      setAssetId(assets[0]?.id || '');
      setDescription('');
      setTagsInput('');
    }
    setError('');
  }, [initialTx, isOpen, assets]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่า 0');
      return;
    }
    if (!assetId) {
      setError('กรุณาเลือกบัญชีที่ต้องการบันทึก');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      type,
      amount: numAmount,
      date,
      category,
      fromAssetId: type === 'expense' ? assetId : undefined,
      toAssetId: type === 'income' ? assetId : undefined,
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs overscroll-contain">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden animate-fadeIn p-4 sm:p-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {initialTx ? 'แก้ไขรายการ' : 'บันทึกรายรับ-รายจ่าย'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>รายจ่าย (Expense)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount input */}
          <div className="relative">
            <span className="absolute left-3 top-2 text-base font-bold text-slate-400">฿</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-lg font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Category & Date in 2 columns */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                หมวดหมู่ *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                วันที่ *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Account/Asset and Description in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                {type === 'income' ? 'เข้าบัญชี *' : 'จ่ายจากบัญชี *'}
              </label>
              <select
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.balance.toLocaleString()} ฿)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                บันทึกช่วยจำ
              </label>
              <input
                type="text"
                placeholder="เช่น กินชาบู, กาแฟ"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
              แท็ก (คั่นด้วยจุลภาค)
            </label>
            <input
              type="text"
              placeholder="เช่น food, cafe, travel"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-xs active:scale-98 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {initialTx ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};



