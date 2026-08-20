import React, { useState, useEffect } from 'react';
import type { Asset, AssetType } from '../../types/finance';
import { X, Wallet, Landmark, TrendingUp, CreditCard, Layers } from 'lucide-react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialAsset?: Asset | null;
}

const ASSET_TYPES: { id: AssetType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'cash', label: 'เงินสด', icon: Wallet },
  { id: 'bank', label: 'ธนาคาร', icon: Landmark },
  { id: 'investment', label: 'ลงทุน/หุ้น', icon: TrendingUp },
  { id: 'credit', label: 'บัตรเครดิต/หนี้', icon: CreditCard },
  { id: 'crypto', label: 'คริปโต', icon: Layers },
  { id: 'other', label: 'อื่นๆ', icon: Wallet },
];

const COLOR_OPTIONS = [

  '#10b981', // Emerald
  '#059669', // Green
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#f59e0b', // Amber
  '#0891b2', // Cyan
  '#475569', // Slate
];

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAsset,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('bank');
  const [balance, setBalance] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialAsset) {
      setName(initialAsset.name);
      setType(initialAsset.type);
      setBalance(String(initialAsset.balance));
      setBankName(initialAsset.bankName || '');
      setAccountNumber(initialAsset.accountNumber || '');
      setColor(initialAsset.color);
      setNotes(initialAsset.notes || '');
    } else {
      setName('');
      setType('bank');
      setBalance('0');
      setBankName('');
      setAccountNumber('');
      setColor('#2563eb');
      setNotes('');
    }
    setError('');
  }, [initialAsset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อบัญชี / ทรัพย์สิน');
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      setError('กรุณาระบุยอดเงินคงเหลือเป็นตัวเลข');
      return;
    }

    onSave({
      name: name.trim(),
      type,
      balance: numBalance,
      currency: 'THB',
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      color,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex min-h-screen items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full my-auto flex flex-col p-4 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative max-h-[calc(100dvh-2rem)] animate-fadeIn">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialAsset ? 'แก้ไขบัญชีทรัพย์สิน' : 'เพิ่มบัญชีทรัพย์สินใหม่'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ระบุรายละเอียด เช่น เงินสด, บัญชีธนาคาร, หรือพอร์ตลงทุน
            </p>
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
          {/* Asset Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ประเภททรัพย์สิน / หนี้สิน *
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {ASSET_TYPES.map((t) => {
                const isSelected = type === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ชื่อบัญชี / รายการทรัพย์สิน *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น เงินสดติดตัว, K-Bank เงินเดือน, พอร์ตหุ้น"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Balance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ยอดเงินคงเหลือปัจจุบัน (บาท) *
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              required
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {type === 'credit' && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                💡 สำหรับบัตรเครดิต ให้ใส่ยอดติดลบ เช่น -15000 หรือใส่ยอดบวก ระบบจะปรับเป็นหนี้สินให้อัตโนมัติ
              </p>
            )}
          </div>

          {/* Conditional Bank Fields */}
          {type === 'bank' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อธนาคาร
                </label>
                <input
                  type="text"
                  placeholder="เช่น กสิกรไทย"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  เลขที่บัญชี
                </label>
                <input
                  type="text"
                  placeholder="xxx-x-xxxxx-x"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              เลือกสีประจำบัญชี
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              บันทึกเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="เช่น บัญชีเงินเดือน, เงินเก็บฉุกเฉิน"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              {initialAsset ? 'บันทึกการแก้ไข' : 'สร้างบัญชี'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
