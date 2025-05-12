import './App.css'
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Import Page Components
import DashboardPage from './pages/DashboardPage';
// import TransactionsPage from './pages/TransactionsPage'; // Removed as the page was deleted
import TransactionsPage from './pages/TransactionsPage'; // Re-import the new page
import BudgetsPage from './pages/BudgetsPage';
// import ReportsPage from './pages/ReportsPage'; // REMOVED IMPORT
import SettingsPage from './pages/SettingsPage';

// Import Common Components
import Header from './components/Header'; // Import the new Header
import BottomNavigationBar from './components/BottomNavigationBar';

// Temporarily importing components that might be needed by pages or for context later
// We will relocate these properly into their respective page components soon.
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryManager from './components/CategoryManager'; // Import CategoryManager
import BudgetPlanner from './components/BudgetPlanner'; // Import BudgetPlanner
import BudgetView from './components/BudgetView'; // Import BudgetView
import DashboardSummary from './components/DashboardSummary'; // Import DashboardSummary
// import SpendingByCategoryChart from './components/SpendingByCategoryChart'; // REMOVED IMPORT
import BudgetProgressSummary from './components/BudgetProgressSummary';   // Import
// import MonthlySpendingTrendChart from './components/MonthlySpendingTrendChart'; // REMOVED IMPORT
import { deleteTransaction as deleteTransactionService } from './services/localStorageService'; // Import the service function
import { getTransactions } from './services/localStorageService'; // Import getTransactions

function App() {
  const [appRefreshKey, setAppRefreshKey] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentMonthPeriod, setCurrentMonthPeriod] = useState('');
  // State to control modal visibility on DashboardPage
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    setCurrentMonthPeriod(`${year}-${month}`);
  }, []);

  const triggerAppRefresh = () => {
    // DEBUG: Log transactions when app refresh is triggered
    const currentTransactions = getTransactions(); // Need to import getTransactions
    console.log('[App.jsx] triggerAppRefresh called. Transactions in LS:', currentTransactions.length, currentTransactions.slice(-5));
    setAppRefreshKey(prevKey => prevKey + 1);
  };

  const handleOpenTransactionModal = (transactionToEdit = null) => {
    setEditingTransaction(transactionToEdit);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null); // Clear editing state when modal closes
  };
  
  const handleTransactionSubmitInModal = () => {
    console.log("Transaction was submitted from modal! Refreshing...");
    triggerAppRefresh();
    handleCloseTransactionModal(); // Close modal and clear editing state
  };

  const handleSetEditingTransaction = (transaction) => {
    // This function might still be useful if we allow editing from a different context in the future
    // For now, opening the modal with a transaction will set it.
    handleOpenTransactionModal(transaction);
  };

  const handleDeleteTransaction = (transactionId) => {
    console.log("Attempting to delete transaction:", transactionId);
    const success = deleteTransactionService(transactionId);
    if (success) {
      console.log("Transaction deleted successfully. Refreshing...");
      triggerAppRefresh();
      if (editingTransaction && editingTransaction.id === transactionId) {
        // If the deleted transaction was being edited in the modal, close the modal.
        handleCloseTransactionModal(); 
      }
    } else {
      console.warn("Failed to delete transaction or transaction not found.");
    }
  };

  const handleCategoryUpdated = () => {
    console.log("Categories were updated! Refreshing relevant components...");
    triggerAppRefresh();
  };

  const globalProps = {
    appRefreshKey,
    currentMonthPeriod,
    editingTransaction, // This will be passed to the modal on DashboardPage
    // onTransactionSubmit: handleTransactionSubmit, // Replaced by handleTransactionSubmitInModal
    onSetEditingTransaction: handleSetEditingTransaction, // Kept for potential future use, but primarily handled by modal open
    onDeleteTransaction: handleDeleteTransaction,
    onCategoryUpdated: handleCategoryUpdated,
    triggerAppRefresh,
    // For DashboardPage to open the modal
    openTransactionModal: handleOpenTransactionModal, 
    isTransactionModalOpen, // For DashboardPage to control the modal
    closeTransactionModal: handleCloseTransactionModal, // For DashboardPage to pass to the modal
    onTransactionSubmitInModal: handleTransactionSubmitInModal // For DashboardPage to pass to the modal
  };
  
  return (
    <Router>
      {/* <Header /> Display Header on all pages - REMOVED FOR PAGE-SPECIFIC TITLES */}
      <div className="main-content-area" style={{ paddingTop: '1rem', paddingBottom: '80px' }}> {/* Adjusted padding */}
        <Routes>
          <Route path="/" element={<DashboardPage {...globalProps} />} />
          {/* Add the route for the transactions page */}
          <Route path="/transactions" element={<TransactionsPage {...globalProps} />} /> 
          <Route path="/budgets" element={<BudgetsPage {...globalProps} />} />
          {/* <Route path="/reports" element={<ReportsPage {...globalProps} />} /> REMOVED ROUTE */}
          <Route path="/settings" element={<SettingsPage {...globalProps} />} />
          <Route path="*" element={<DashboardPage {...globalProps} />} />
        </Routes>
      </div>
      <BottomNavigationBar isModalOpen={isTransactionModalOpen} /> {/* Pass modal state */}
    </Router>
  );
}

export default App;
