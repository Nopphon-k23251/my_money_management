import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, ArrowRightLeft } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { assets, transferFunds } = useFinance();
  const [fromAssetId, setFromAssetId] = useState(assets[0]?.id || '');
  const [toAssetId, setToAssetId] = useState(assets[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAssetId || !toAssetId) {
      setError('กรุณาเลือกบัญชีต้นทางและปลายทาง');
      return;
    }
    if (fromAssetId === toAssetId) {
      setError('บัญชีต้นทางและปลายทางต้องไม่เป็นบัญชีเดียวกัน');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('จำนวนเงินที่โอนต้องมากกว่า 0');
      return;
    }

    transferFunds(fromAssetId, toAssetId, numAmount, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex min-h-screen items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full my-auto flex flex-col p-4 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative max-h-[calc(100dvh-2rem)] animate-fadeIn">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">โอนเงินระหว่างบัญชี</h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 pb-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              จากบัญชีต้นทาง (From) *
            </label>
            <select
              required
              value={fromAssetId}
              onChange={(e) => setFromAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.balance.toLocaleString()} บาท)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ไปยังบัญชีปลายทาง (To) *
            </label>
            <select
              required
              value={toAssetId}
              onChange={(e) => setToAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id} disabled={a.id === fromAssetId}>
                  {a.name} ({a.balance.toLocaleString()} บาท)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-base font-bold text-slate-400">฿</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2 text-lg font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              บันทึกช่วยจำ (Note)
            </label>
            <input
              type="text"
              placeholder="เช่น ถอนเงินสดใช้จ่าย, เติมเงินพอร์ตหุ้น"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
            >
              ยืนยันการโอนเงิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


