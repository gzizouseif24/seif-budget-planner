import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions, getCategories } from '../services/localStorageService';
import './TransactionList.css'; // Import the new CSS file

function TransactionList({ onEditTransaction, onDeleteTransaction }) {
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
  }, []);

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

  if (transactions.length === 0) {
    return <p className="no-transactions-message">No transactions yet. Add one using the form above!</p>;
  }

  return (
    <div className="transaction-list-container">
      <h3>Transaction History</h3>
      
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

      <ul className="transaction-list">
        {filteredTransactions.map(transaction => {
          const categoryDetails = getCategoryDetails(transaction.categoryId);
          return (
            <li key={transaction.id} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-info">
                <div>
                  <strong>Date:</strong> <span className="date">{transaction.date}</span>
                </div>
                <div>
                  <strong>Category:</strong> 
                  {categoryDetails.iconEmoji && <span className="category-emoji">{categoryDetails.iconEmoji} </span>}
                  <span className="category-name">{categoryDetails.name}</span>
                </div>
                {transaction.note && (
                  <div className="note">
                    <strong>Note:</strong> <em>{transaction.note}</em>
                  </div>
                )}
              </div>
              <div className="transaction-amount-type">
                <span className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </span>
                <span className="type">({transaction.type})</span>
              </div>
              <div className="transaction-actions">
                <button 
                  onClick={() => onEditTransaction(transaction)} 
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this transaction?')) {
                      onDeleteTransaction(transaction.id);
                    }
                  }} 
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TransactionList; 