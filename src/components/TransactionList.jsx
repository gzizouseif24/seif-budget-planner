import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions, getCategories } from '../services/localStorageService';
import './TransactionList.css'; // Import the new CSS file

// Accept the handlers as props now
function TransactionList({ onEditTransaction, onDeleteTransaction, appRefreshKey }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' or category.id

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const loadedTransactions = getTransactions();
      const loadedCategories = getCategories();
      setTransactions(loadedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort by date, newest first
      setCategories(loadedCategories);
      setLoading(false);
    };
    loadData();
    // Reload data when appRefreshKey changes (e.g., after add/edit/delete)
  }, [appRefreshKey]); 

  // Effect to reset category filter if the selected category is not valid for the current type filter
  useEffect(() => {
    if (filterCategory !== 'all') {
      const selectedCategoryDetails = categories.find(c => c.id === filterCategory);
      if (selectedCategoryDetails && filterType !== 'all' && selectedCategoryDetails.type !== filterType) {
        setFilterCategory('all'); // Reset if category type doesn't match filter type
      }
    }
  }, [filterType, filterCategory, categories]);

  const getCategoryDetails = (categoryId) => {
    return categories.find(c => c.id === categoryId) || { name: 'Unknown Category', iconEmoji: '' };
  };

  const availableCategoriesForFilter = useMemo(() => {
    if (filterType === 'all') {
      return categories;
    }
    return categories.filter(c => c.type === filterType);
  }, [categories, filterType]);

  // Memoize filtered transactions to avoid re-calculating on every render unless dependencies change
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        if (filterType === 'all') return true;
        return transaction.type === filterType;
      })
      .filter(transaction => {
        if (filterCategory === 'all') return true;
        return transaction.categoryId === filterCategory;
      });
  }, [transactions, filterType, filterCategory]);

  if (loading) {
    return <p className="loading-message">Loading transactions...</p>;
  }

  // Use filteredTransactions count for the empty message check
  if (transactions.length === 0) { 
    return <p className="no-transactions-message">No transactions recorded yet.</p>;
  }

  return (
    <div className="transaction-list-container">
      {/* Moved title out, will be handled by the parent page */}
      {/* <h3>Transaction History</h3> */}
      
      {/* Filter Controls */} 
      <div className="transaction-filters">
        <div>
          <label htmlFor="filterType">Filter by Type:</label>
          <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label htmlFor="filterCategory">Filter by Category:</label>
          <select id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {availableCategoriesForFilter.map(category => (
              <option key={category.id} value={category.id}>
                {category.iconEmoji ? `${category.iconEmoji} ` : ''}{category.name} {filterType === 'all' ? `(${category.type})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <p className="no-transactions-message">No transactions match your current filters.</p>
      )}

      {/* Use filteredTransactions here */}
      {filteredTransactions.length > 0 && ( 
        <ul className="transaction-list">
          {filteredTransactions.map(transaction => {
            const categoryDetails = getCategoryDetails(transaction.categoryId);
            
            // Date Formatting
            const formatDate = (dateString) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              // Adjust for potential timezone issues by using UTC methods if necessary, 
              // but for simple MM/DD, local time should be fine unless crossing midnight boundaries.
              // Add 1 to month because getMonth() is 0-indexed
              const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
              const day = date.getDate().toString().padStart(2, '0');
              return `${month}/${day}`;
            };

            const handleEdit = () => {
                if (onEditTransaction) {
                    onEditTransaction(transaction);
                } else {
                    console.warn("onEditTransaction handler not provided to TransactionList");
                }
            };
            const handleDelete = () => {
                if (onDeleteTransaction) {
                    if (window.confirm('Are you sure you want to delete this transaction?')) {
                        onDeleteTransaction(transaction.id);
                    }
                } else {
                     console.warn("onDeleteTransaction handler not provided to TransactionList");
                }
            };
            return (
              <li key={transaction.id} className={`transaction-item ${transaction.type}`}>
                {/* Top Row: Date and Emoji */}
                <div className="transaction-primary-info">
                   {categoryDetails.iconEmoji && <span className="category-emoji">{categoryDetails.iconEmoji}</span>}
                   <span className="date">{formatDate(transaction.date)}</span>
                </div>

                {/* Middle Row: Amount, Type, and Note */}
                <div className="transaction-amount-details">
                  <div className="transaction-amount-type">
                    <span className={`transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                      {transaction.type === 'expense' ? '-' : '+'}{Math.abs(transaction.amount).toFixed(2)}
                      <span className="currency-suffix"> TND</span>
                    </span>
                    <span className="type">({transaction.type})</span>
                  </div>
                  {transaction.note && (
                    <div className="note">
                      <em>{transaction.note}</em> {/* Removed "Note:" label */}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Actions */}
                <div className="transaction-actions">
                  <button 
                    onClick={handleEdit} // Use the handler
                    className="btn btn-secondary btn-sm"
                    disabled={!onEditTransaction} // Disable if handler missing
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleDelete} // Use the handler
                    className="btn btn-danger btn-sm"
                    disabled={!onDeleteTransaction} // Disable if handler missing
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default TransactionList; 