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
  loadTransactions, 
  saveTransactions, 
  loadInventory, 
  saveInventory, 
  loadSettings, 
  saveSettings,
  resetToFactoryDefaults 
} from './utils/storage';

const DashboardApp = () => {
  const { user, permissions } = useAuth();

  // Primary Application State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [transactions, setTransactions] = useState(() => loadTransactions());
  const [inventory, setInventory] = useState(() => loadInventory());
  const [settings, setSettings] = useState(() => loadSettings());

  // Modal States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync state to localstorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Transaction Actions
  const handleSaveTransaction = (transactionData) => {
    const exists = transactions.some(t => t.id === transactionData.id);
    let updated;
    if (exists) {
      updated = transactions.map(t => t.id === transactionData.id ? transactionData : t);
    } else {
      updated = [transactionData, ...transactions];
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
    setTransactions(updated);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    if (!permissions.canDeleteTransaction) {
      alert('Tài khoản của bạn không có quyền xóa giao dịch!');
      return;
    }
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
  };

  const handleSaveInventory = (updatedInventory) => {
    setInventory(updatedInventory);
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
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
