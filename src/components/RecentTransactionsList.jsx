import React, { useState, useEffect } from 'react';
import { getTransactions, getCategories } from '../services/localStorageService';
import './RecentTransactionsList.css'; // We'll create this CSS file next

function RecentTransactionsList({ numberOfTransactionsToShow = 3, onEditTransaction, onDeleteTransaction, appRefreshKey }) {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    console.log(`[RecentTransactionsList] useEffect triggered. appRefreshKey: ${appRefreshKey}, numberOfTransactionsToShow: ${numberOfTransactionsToShow}`);
    const loadedCategories = getCategories();
    setCategories(loadedCategories);

    const allTransactions = getTransactions(); // This will now log extensively from LS_Service
    console.log('[RecentTransactionsList] Raw transactions from getTransactions():', JSON.parse(JSON.stringify(allTransactions.slice(0,10)))); // Log first 10 raw transactions
    
    // Sort transactions by date, most recent first
    const sortedTransactions = [...allTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentTransactions(sortedTransactions.slice(0, numberOfTransactionsToShow));
    console.log('[RecentTransactionsList] Set recentTransactions (first 3):', JSON.parse(JSON.stringify(recentTransactions.slice(0,3))));

  }, [numberOfTransactionsToShow, appRefreshKey]); // Added appRefreshKey to dependency array to refresh list

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || {};
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="recent-transactions-container card">
        <h4>Recent Transactions</h4>
        <p>No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="recent-transactions-container card">
      <h4>Recent Transactions</h4>
      <ul className="recent-transactions-list">
        {recentTransactions.map(transaction => {
          const category = getCategoryInfo(transaction.categoryId);
          const handleDelete = () => {
            if (window.confirm('Are you sure you want to delete this transaction?')) {
              onDeleteTransaction(transaction.id);
            }
          };
          return (
            <li key={transaction.id} className="recent-transaction-item">
              <div className="transaction-info" onClick={() => onEditTransaction(transaction)} style={{ cursor: 'pointer' }}>
                <span className="transaction-emoji" role="img" aria-label={category.name || 'category'}>
                  {category.iconEmoji || '💸'} {/* Default emoji if none */}
                </span>
                <div className="transaction-details">
                  <span className="transaction-category-name">{category.name || transaction.description || 'N/A'}</span>
                  <span className="transaction-date">{formatDate(transaction.date)}</span>
                </div>
              </div>
              <div className={`transaction-amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}`}>
                {transaction.type === 'expense' ? '−' : '+'}
                ${Math.abs(transaction.amount).toFixed(2)}
              </div>
              <button onClick={handleDelete} className="delete-transaction-btn" aria-label="Delete transaction">
                &times;
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RecentTransactionsList; 