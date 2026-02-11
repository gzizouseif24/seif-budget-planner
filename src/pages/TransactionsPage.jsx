import React from 'react';
import TransactionList from '../components/TransactionList';
// Optional: Import page-specific styles if needed
// import './TransactionsPage.css'; 

function TransactionsPage(props) {
  // Destructure props passed from App.jsx, including handlers and refresh key
  const {
    openTransactionModal, // Use this for editing
    onDeleteTransaction,  // Use this for deleting
    appRefreshKey
    // other global props if needed
  } = props;

  return (
    <div className="page-container" style={{ padding: '1rem' }}> {/* Basic container */}
      <h2 style={{ marginBottom: '1.5rem' }}>All Transactions</h2>
      
      <TransactionList 
        onEditTransaction={openTransactionModal} // Pass the modal opener for editing
        onDeleteTransaction={onDeleteTransaction}
        appRefreshKey={appRefreshKey} // Pass the key to trigger reloads
      />
      
      {/* Add other content for this page if necessary */}
    </div>
  );
}

export default TransactionsPage; 