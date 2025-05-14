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
  // Add state for the processed list that will include daily summaries
  const [displayItems, setDisplayItems] = useState([]);

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const loadedTransactions = getTransactions();
      const loadedCategories = getCategories();
      
      // --- START: New logic for processing transactions and creating summaries ---
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to the start of the day for accurate comparison

      const pastDayExpenses = {}; // Stores { 'YYYY-MM-DD': totalAmount }
      const currentDayTransactions = [];
      const incomeTransactions = [];

      loadedTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        transactionDate.setHours(0, 0, 0, 0); // Normalize transaction date

        if (transaction.type === 'income') {
          incomeTransactions.push(transaction);
        } else { // Expense transactions
          if (transactionDate.getTime() < today.getTime()) { // Past day expense
            const dateString = transaction.date; // Use original YYYY-MM-DD string for grouping
            if (!pastDayExpenses[dateString]) {
              pastDayExpenses[dateString] = 0;
            }
            pastDayExpenses[dateString] += transaction.amount;
          } else { // Current day expense
            currentDayTransactions.push(transaction);
          }
        }
      });

      let newDisplayItems = [];
      // Add daily expense summaries
      for (const dateString in pastDayExpenses) {
        newDisplayItems.push({
          id: `summary-${dateString}`, // Unique ID for the summary item
          type: 'expense_summary', // Special type for identification
          date: dateString,
          amount: pastDayExpenses[dateString],
          isSummary: true,
        });
      }

      // Add individual income transactions (all dates)
      newDisplayItems = newDisplayItems.concat(incomeTransactions);
      // Add individual current day expense transactions
      newDisplayItems = newDisplayItems.concat(currentDayTransactions);

      // Sort all display items: summaries and individual transactions by date, newest first
      // For items on the same date, summaries (representing the whole day) might come before individual items
      // or we ensure individual items of that day are not shown if a summary for that day exists (for expenses).
      // The current logic separates past day expenses into summaries, and keeps income and current day expenses separate.
      newDisplayItems.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime(); // Sort by date descending
        }
        // If dates are the same, summaries might be ordered differently if needed, or by ID for stability
        // For now, primary sort by date is most important.
        // If 'a' is a summary and 'b' is not, 'a' might come first for that day or based on how we want to group visually.
        // However, income of that day will also be there. Let's just sort by date for now, then ID for tie-breaking.
        if (a.isSummary && !b.isSummary && dateA.getTime() === dateB.getTime()) return -1; // Summaries first on their day
        if (!a.isSummary && b.isSummary && dateA.getTime() === dateB.getTime()) return 1;  // Summaries first on their day
        return (b.id > a.id) ? 1 : -1; // Fallback sort by ID descending for stability
      });
      
      setDisplayItems(newDisplayItems);
      // setTransactions(loadedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))); // Original line, replaced by setDisplayItems
      // --- END: New logic --- 
      
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
  const filteredDisplayItems = useMemo(() => {
    return displayItems
      .filter(item => {
        if (filterType === 'all') return true;
        if (filterType === 'income' && item.type === 'income') return true;
        if (filterType === 'expense' && (item.type === 'expense' || item.isSummary)) return true; // Summaries are expenses
        return false;
      })
      .filter(item => {
        if (item.isSummary) return true; // Category filter does not apply to summaries
        if (filterCategory === 'all') return true;
        return item.categoryId === filterCategory;
      });
  }, [displayItems, filterType, filterCategory]);

  if (loading) {
    return <p className="loading-message">Loading transactions...</p>;
  }

  // Use filteredTransactions count for the empty message check
  if (displayItems.length === 0) { 
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

      {filteredDisplayItems.length === 0 && displayItems.length > 0 && (
        <p className="no-transactions-message">No transactions match your current filters.</p>
      )}

      {/* Use filteredDisplayItems here and map over them */}
      {filteredDisplayItems.length > 0 && ( 
        <ul className="transaction-list">
          {filteredDisplayItems.map(item => {
            if (item.isSummary) {
              // --- Render Daily Expense Summary Item ---
              const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
                const day = date.getDate().toString().padStart(2, '0');
                return `${month}/${day}`;
              };
              return (
                <li key={item.id} className="transaction-item daily-summary-item">
                  <div className="transaction-primary-info">
                    <span className="category-emoji">📊</span> {/* Or a specific summary emoji */}
                    <span className="date">{formatDate(item.date)} - Daily Expenses</span>
                  </div>
                  <div className="transaction-amount-details">
                    <div className="transaction-amount-type">
                      <span className="transaction-amount expense">
                        -{Math.abs(item.amount).toFixed(2)}
                        <span className="currency-suffix"> TND</span>
                      </span>
                    </div>
                  </div>
                  {/* No actions for summary items */}
                </li>
              );
            }
            
            // --- Render Individual Transaction Item (existing logic) ---
            const transaction = item; // Treat item as a transaction now
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