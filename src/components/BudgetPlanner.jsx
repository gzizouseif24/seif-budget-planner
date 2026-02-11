import React, { useState, useEffect, useMemo } from 'react';
import { getCategories, getBudgets, saveBudget } from '../services/localStorageService';
import './BudgetPlanner.css'; // Import the new CSS file

function BudgetPlanner({ appRefreshKey }) { // Added appRefreshKey for data refresh
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [budgets, setBudgets] = useState({}); // Store budgets as an object: { categoryId_period: amount }
  const [currentMonthPeriod, setCurrentMonthPeriod] = useState(''); // e.g., "2024-07"

  useEffect(() => {
    // Determine current month period string (YYYY-MM)
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // JavaScript months are 0-indexed
    setCurrentMonthPeriod(`${year}-${month}`);
  }, []);

  useEffect(() => {
    if (!currentMonthPeriod) return; // Don't load data until period is set

    const allCategories = getCategories();
    setExpenseCategories(allCategories.filter(cat => cat.type === 'expense'));

    const loadedBudgets = getBudgets(); // This gets all budgets for all periods
    const currentMonthBudgets = {};
    loadedBudgets.forEach(budget => {
      if (budget.period === currentMonthPeriod) {
        currentMonthBudgets[budget.categoryId] = budget.amount;
      }
    });
    setBudgets(currentMonthBudgets);

  }, [currentMonthPeriod, appRefreshKey]); // Reload if appRefreshKey changes

  const handleBudgetChange = (categoryId, amountStr) => {
    const amount = parseFloat(amountStr);

    if (amountStr === '' || isNaN(amount) || amount < 0) {
      // If input is cleared or invalid, we might want to remove the budget or set it to 0
      // For now, let's treat empty or invalid as an intent to clear/ignore that specific input change for saving
      // but update the local display to show the input field being cleared.
      setBudgets(prevBudgets => ({
        ...prevBudgets,
        [categoryId]: amountStr === '' ? '' : (prevBudgets[categoryId] || '') // Keep empty or previous valid if invalid now
      }));
      // To save an empty or zero budget, explicitly save 0 or handle deletion
      // For now, we only save valid positive numbers or updates to them. Let's save empty string as deleting the budget for that category and period.
      if (amountStr === '') {
        saveBudget({ categoryId, period: currentMonthPeriod, amount: null }); // Or implement a deleteBudget function
      }
      return; 
    }

    setBudgets(prevBudgets => ({
      ...prevBudgets,
      [categoryId]: amount,
    }));

    saveBudget({ 
      categoryId: categoryId,
      period: currentMonthPeriod, 
      amount: amount 
    });
    // Potentially call a callback to App.jsx if other components need to know budgets changed
  };

  if (!currentMonthPeriod) {
    return <p className="loading-message">Initializing budget planner...</p>;
  }

  return (
    <div className="budget-planner-container">
      <h3>Set Monthly Budgets (for {currentMonthPeriod})</h3>
      {expenseCategories.length === 0 ? (
        <p className="no-categories-message">No expense categories found. Please add some in the Category Manager.</p>
      ) : (
        <ul className="budget-planner-list">
          {expenseCategories.map(category => (
            <li key={category.id}>
              <label htmlFor={`budget-${category.id}`}>
                {category.name}
              </label>
              <input 
                type="number" 
                id={`budget-${category.id}`} 
                value={budgets[category.id] !== undefined ? budgets[category.id] : ''} // Handle undefined for initial empty display
                onChange={(e) => handleBudgetChange(category.id, e.target.value)} 
                placeholder="0.00" 
                min="0" 
                step="0.01" 
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BudgetPlanner; 