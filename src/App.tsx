import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssetsView } from './components/assets/AssetsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { BudgetView } from './components/budget/BudgetView';
import { AssetModal } from './components/assets/AssetModal';
import { TransactionModal } from './components/transactions/TransactionModal';
import { TransferModal } from './components/assets/TransferModal';
import { Plus } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, addAsset, addTransaction } = useFinance();
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <Navbar
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
        onOpenTransfer={() => setIsTransferOpen(true)}
      />


      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-full overflow-x-hidden pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddAsset={() => setIsAddAssetOpen(true)}
              onOpenAddTransaction={() => setIsAddTxOpen(true)}
            />
          )}
          {activeTab === 'assets' && <AssetsView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'budget' && <BudgetView />}
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) for ultra-fast transaction entry */}
      <div className="md:hidden fixed right-4 bottom-20 z-40">
        <button
          onClick={() => setIsAddTxOpen(true)}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-400/50 active:scale-90 transition-all"
          aria-label="บันทึกรายการด่วน"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Global Quick Action Modals */}
      <AssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onSave={addAsset}
      />

      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSave={addTransaction}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainContent />
      </FinanceProvider>
    </AuthProvider>
  );
}


