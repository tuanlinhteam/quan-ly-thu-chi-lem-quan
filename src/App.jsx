import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { DashboardOverview } from './components/DashboardOverview';
import { IncomeExpenseLedger } from './components/IncomeExpenseLedger';
import { InventoryManagement } from './components/InventoryManagement';
import { FinancialReports } from './components/FinancialReports';
import { UserSettings } from './components/UserSettings';
import { TransactionModal } from './components/TransactionModal';
import { 
  initFirebaseData,
  listenTransactions,
  listenInventory,
  listenSettings,
  saveTransactions, 
  saveInventory, 
  saveSettings,
  sortTransactionsByDateTime,
  resetToFactoryDefaults 
} from './utils/storage';

const DashboardApp = () => {
  const { user, permissions } = useAuth();

  // Primary Application State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [transactions, setTransactions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [settings, setSettings] = useState({});

  // Modal States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Initialize Firebase data & subscribe to real-time updates
  useEffect(() => {
    initFirebaseData();

    // Real-time listeners — all devices see changes instantly!
    const unsubTransactions = listenTransactions((data) => {
      setTransactions(sortTransactionsByDateTime(data));
      setLoading(false);
    });

    const unsubInventory = listenInventory((data) => {
      setInventory(data);
    });

    const unsubSettings = listenSettings((data) => {
      setSettings(data);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubTransactions();
      unsubInventory();
      unsubSettings();
    };
  }, []);

  // Transaction Actions
  const handleSaveTransaction = (transactionData) => {
    const exists = transactions.some(t => t.id === transactionData.id);
    const txWithTimestamp = {
      ...transactionData,
      updatedAt: Date.now()
    };

    let updated;
    if (exists) {
      // User EDITED an existing transaction -> replace & mark updatedAt
      updated = transactions.map(t => t.id === transactionData.id ? txWithTimestamp : t);
    } else {
      // User ADDED a new transaction
      updated = [txWithTimestamp, ...transactions];
      // Fire celebratory confetti for big sales!
      if (transactionData.type === 'INCOME' && transactionData.amount >= 5000000) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    }

    // Auto sort by Date & Time logic whenever a transaction is added OR edited!
    const sortedUpdated = sortTransactionsByDateTime(updated);

    setTransactions(sortedUpdated);
    saveTransactions(sortedUpdated); // Save sorted dataset to Firebase
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    if (!permissions.canDeleteTransaction) {
      alert('Tài khoản của bạn không có quyền xóa giao dịch!');
      return;
    }
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated); // Save to Firebase
  };

  const handleSaveInventory = (updatedInventory) => {
    setInventory(updatedInventory);
    saveInventory(updatedInventory); // Save to Firebase
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings); // Save to Firebase
  };

  const handleOpenAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransactionClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-ocean-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-ocean-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-amber-400 font-bold text-sm">Đang kết nối cơ sở dữ liệu...</p>
            <p className="text-slate-500 text-xs mt-1">Firebase Realtime Database</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onResetData={resetToFactoryDefaults}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddTransaction={handleOpenAddTransaction}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              transactions={transactions}
              inventory={inventory}
              settings={settings}
              onOpenAddTransaction={handleOpenAddTransaction}
              onNavigateToLedger={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'ledger' && (
            <IncomeExpenseLedger 
              transactions={transactions}
              onSaveTransaction={handleEditTransactionClick}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddTransaction={handleOpenAddTransaction}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManagement 
              inventory={inventory}
              onSaveInventory={handleSaveInventory}
              onAddTransactionFromInventory={handleSaveTransaction}
            />
          )}

          {activeTab === 'financial-reports' && permissions.canAccessShareholderReport && (
            <FinancialReports 
              transactions={transactions}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && permissions.canManageUsers && (
            <UserSettings 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetData={resetToFactoryDefaults}
            />
          )}
        </main>
      </div>

      {/* Transaction Entry/Edit Modal Drawer */}
      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSaveTransaction={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Account Login Modal Overlay (when requested or signed out) */}
      <LoginModal 
        isOpen={!user || isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}
