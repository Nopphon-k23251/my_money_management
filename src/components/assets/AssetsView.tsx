import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import type { Asset, AssetType } from '../../types/finance';

import { formatCurrency } from '../../utils/formatters';
import { AssetModal } from './AssetModal';
import { TransferModal } from './TransferModal';
import {
  Wallet,
  Landmark,
  TrendingUp,
  CreditCard,
  Layers,
  Plus,
  ArrowRightLeft,
  Pencil,
  Trash2,
} from 'lucide-react';

import { ConfirmDeleteModal } from '../common/Toast';

export const AssetsView: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, netWorthData } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'THB';

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAssets =
    filterType === 'all' ? assets : assets.filter((a) => a.type === filterType);

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'cash':
        return Wallet;
      case 'bank':
        return Landmark;
      case 'investment':
        return TrendingUp;
      case 'credit':
        return CreditCard;
      case 'crypto':
      case 'other':
      default:
        return Layers;
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };


  const handleSaveAsset = (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAsset) {
      updateAsset(editingAsset.id, assetData);
    } else {
      addAsset(assetData);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-12">
      {/* Header & New Asset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">จัดการบัญชีทรัพย์สิน & หนี้สิน</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            รวมมูลค่าสินทรัพย์สุทธิ {formatCurrency(netWorthData.netWorth, currency)} ({assets.length} บัญชี)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {assets.length > 1 && (
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>โอนเงิน</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingAsset(null);
              setIsAssetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบัญชีใหม่</span>
          </button>
        </div>
      </div>

      {/* Type Filter Tabs */}
      {assets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'cash', label: 'เงินสด' },
            { id: 'bank', label: 'ธนาคาร' },
            { id: 'investment', label: 'การลงทุน' },
            { id: 'credit', label: 'บัตรเครดิต/หนี้สิน' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Asset Cards Grid or Empty Prompt */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">ยังไม่มีข้อมูลบัญชีหรือทรัพย์สิน</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            สร้างบัญชีแรกของคุณ เช่น เงินสดในกระเป๋า บัญชีธนาคาร หรือพอร์ตหุ้น เพื่อเริ่มจัดการการเงิน
          </p>
          <button
            onClick={() => {
              setEditingAsset(null);
              setIsAssetModalOpen(true);
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs active:scale-98"
          >
            + เพิ่มบัญชีแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredAssets.map((asset) => {
            const Icon = getAssetIcon(asset.type);
            const isNegative = asset.balance < 0;

            return (
              <div
                key={asset.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: asset.color || '#6366f1' }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {asset.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {asset.bankName ? `${asset.bankName} • ` : ''}
                          {asset.accountNumber || (asset.type === 'cash' ? 'เงินสด' : asset.type)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(asset)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="แก้ไขบัญชี"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id, asset.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="ลบบัญชี"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {isNegative ? 'ยอดค้างชำระ (หนี้สิน)' : 'ยอดเงินคงเหลือ'}
                    </span>
                    <div
                      className={`text-xl sm:text-2xl font-bold tracking-tight mt-0.5 ${
                        isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatCurrency(asset.balance, currency)}
                    </div>
                  </div>

                  {asset.accountNumber && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl inline-block border border-slate-100 dark:border-slate-800">
                      เลขที่: {asset.accountNumber}
                    </div>
                  )}
                  {asset.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                      "{asset.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="capitalize font-semibold">{asset.type}</span>
                  <span>อัปเดต {new Date(asset.updatedAt).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        initialAsset={editingAsset}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAsset(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="ยืนยันการลบบัญชีทรัพย์สิน"
        description="คุณต้องการลบบัญชีนี้ใช่หรือไม่? บันทึกธุรกรรมที่เกี่ยวข้องจะยังคงอยู่แต่จะไม่สามารถคำนวณยอดเงินของบัญชีนี้ได้อีกต่อไป"
        itemDetails={deleteTarget ? `บัญชี: ${deleteTarget.name}` : undefined}
      />
    </div>
  );
};


