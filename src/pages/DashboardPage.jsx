import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
// import { Link } from 'react-router-dom'; // No longer needed for Add Transaction button

// Import components to be rendered on this page
import DashboardSummary from '../components/DashboardSummary';
import BudgetProgressSummary from '../components/BudgetProgressSummary';
import RecentTransactionsList from '../components/RecentTransactionsList';
import TransactionModal from '../components/TransactionModal'; // Import the modal
import './DashboardPage.css'; // Import the CSS file

// Import styles for this page if any (optional, or use global styles)
// import './DashboardPage.css'; 

// Helper function to format YYYY-MM to Month YYYY
const formatMonthYear = (period) => {
  if (!period || !period.includes('-')) return 'Current Month'; // Fallback
  // Add a day to make it a valid date string for parsing
  const dateStr = `${period}-01`; 
  try {
    const date = new Date(dateStr);
    // Adjust for potential timezone issues by using UTC methods if the locale string is inconsistent
    // For month/year, it's usually less critical than exact day formatting.
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch (e) {
    console.error("Error formatting date period:", e);
    return period; // Fallback to original period string on error
  }
};

function DashboardPage(props) {
  const {
    appRefreshKey,
    currentMonthPeriod,
    // Props for modal control, passed from App.jsx
    openTransactionModal,
    isTransactionModalOpen,
    closeTransactionModal,
    editingTransaction, // To pass to the modal if editing
    onTransactionSubmitInModal, // The submit handler for the modal's form
    onDeleteTransaction // Added this line
  } = props;

  const displayMonth = formatMonthYear(currentMonthPeriod);

  return (
    <div className="dashboard-page-container">
      <h1 className="dashboard-title">Budget for {displayMonth}</h1>

      <div className="add-transaction-button-container">
        <button 
          onClick={() => openTransactionModal()} // Open modal for new transaction
          className="btn btn-primary" // This class will be styled by DashboardPage.css or App.css
        >
          + Add New Transaction
        </button>
      </div>

      <DashboardSummary 
        appRefreshKey={appRefreshKey} 
        currentMonthPeriod={currentMonthPeriod} // Pass currentMonthPeriod to DashboardSummary
      />
      
      <div className="dashboard-separator"></div>

      <BudgetProgressSummary 
        appRefreshKey={appRefreshKey} 
        currentMonthPeriod={currentMonthPeriod} 
      />

      <div className="dashboard-separator"></div>

      {/* For RecentTransactionsList, it manages its own data fetching based on localStorage 
          but might need appRefreshKey if we want to force a refresh from a global action not 
          directly related to its internal state (e.g. after a settings change affecting categories).
          For now, let's assume it handles its refresh. If not, pass appRefreshKey. 
          The numberOfTransactionsToShow can be a prop here.
      */}
      <RecentTransactionsList 
        numberOfTransactionsToShow={3}
        appRefreshKey={appRefreshKey} // Ensure this refreshes if a transaction is added/edited via modal
        onEditTransaction={openTransactionModal} // Pass the function to open modal for editing
        onDeleteTransaction={onDeleteTransaction} // Pass the onDeleteTransaction from DashboardPage's props
      />

      {/* Add link to view all transactions */}
      <div className="view-all-transactions-link" style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/transactions" className="btn btn-link"> 
          View All Transactions
        </Link>
      </div>

      {/* Render the modal */}
      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onTransactionSubmit={onTransactionSubmitInModal}
        existingTransaction={editingTransaction}
      />

      {/* 
        Placeholder for where other dashboard specific content might go.
        E.g., quick insights, tips, etc.
      */}
    </div>
  );
}

export default DashboardPage; 