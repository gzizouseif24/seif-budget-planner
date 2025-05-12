import React, { useState, useEffect } from 'react';
import './BudgetView.css'; // Import the new CSS file
import {
  getCategories,
  getBudgetForCategoryAndPeriod,
} from '../services/localStorageService';
import { calculateActualSpending } from '../services/budgetUtils';

// Updated ProgressBar component using CSS classes
const ProgressBar = ({ value, max, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const displayPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="budget-view-progress-bar-container">
      <div
        className="budget-view-progress-bar-fill"
        style={{
          width: `${displayPercentage}%`,
          backgroundColor: color || 'var(--accent-color-green)', // Use passed color
        }}
      >
        {/* Optional: display percentage text inside bar if desired */}
      </div>
    </div>
  );
};

// Accept onEditBudget prop
function BudgetView({ appRefreshKey, onEditBudget }) {
  const [budgetDetails, setBudgetDetails] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({}); // Store categories by ID for easy lookup
  const [currentMonthPeriod, setCurrentMonthPeriod] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    setCurrentMonthPeriod(`${year}-${month}`);
  }, []);

  useEffect(() => {
    if (!currentMonthPeriod) return;

    setLoading(true);
    const allCategories = getCategories();
    // Create a map for faster lookups
    const catMap = allCategories.reduce((acc, cat) => {
        acc[cat.id] = cat;
        return acc;
    }, {});
    setCategoriesMap(catMap);

    const expenseCategories = allCategories.filter(cat => cat.type === 'expense');
    
    const details = expenseCategories.map(category => {
      const budgetData = getBudgetForCategoryAndPeriod(category.id, currentMonthPeriod);
      const budgetAmount = budgetData ? budgetData.amount : 0;
      const numericBudgetAmount = Number(budgetAmount) || 0; 
      const actualSpending = calculateActualSpending(category.id, currentMonthPeriod);
      const remainingAmount = numericBudgetAmount - actualSpending;
      
      return {
        categoryId: category.id,
        budgetAmount: numericBudgetAmount,
        actualSpending,
        remainingAmount,
      };
    }).filter(detail => detail.budgetAmount > 0); // Only show categories with a set budget

    setBudgetDetails(details);
    setLoading(false);
  }, [currentMonthPeriod, appRefreshKey]);

  if (loading && !currentMonthPeriod) {
    return <p className="loading-message">Initializing budget view...</p>;
  }
  if (loading) {
    return <p className="loading-message">Loading budget details for {currentMonthPeriod}...</p>;
  }

  return (
    <div className="budget-view-container">
      {/*<h3>Budget Status (for {currentMonthPeriod})</h3>*/}{/* Title Removed */}
      {budgetDetails.length === 0 ? (
        <p className="no-budgets-message">
          No budgets set for expense categories this month.
        </p>
      ) : (
        <ul className="budget-view-list">
          {budgetDetails.map(detail => {
            const category = categoriesMap[detail.categoryId];
            if (!category) return null; // Should not happen if data is consistent

            const isOverBudget = detail.remainingAmount < 0;
            const spendingPercentage = detail.budgetAmount > 0 ? (detail.actualSpending / detail.budgetAmount) * 100 : 0;
            
            // Determine progress bar color based on category color and spending percentage
            let progressBarColor = category.color || 'var(--default-progress-color, #757575)'; // Use category color or a default
            let statusClass = 'on-track';
            let statusTextColor = 'var(--text-color-secondary)'; // Default status text color

            if (spendingPercentage > 100) {
                progressBarColor = 'var(--accent-color-red)'; // Override with red if over budget
                statusClass = 'over-budget';
                statusTextColor = 'var(--accent-color-red)';
            } else if (spendingPercentage > 85) {
                // Keep category color, but maybe change status text color slightly?
                statusTextColor = 'var(--accent-color-yellow)';
                statusClass = 'nearing-limit'; // Optional distinct class
            } else {
                 statusTextColor = 'var(--accent-color-green)';
            }
            
            const budgetAmountDisplay = typeof detail.budgetAmount === 'number' ? detail.budgetAmount.toFixed(2) : '0.00';
            const actualSpendingDisplay = typeof detail.actualSpending === 'number' ? detail.actualSpending.toFixed(2) : '0.00';
            const remainingAmountDisplay = typeof detail.remainingAmount === 'number' ? Math.abs(detail.remainingAmount).toFixed(2) : '0.00';

            const handleEditClick = () => {
              if (onEditBudget) {
                // Pass the budget data needed for the form
                onEditBudget({ categoryId: detail.categoryId, amount: detail.budgetAmount }); 
              }
            };

            return (
              <li key={detail.categoryId} className="budget-view-item">
                <div className="budget-item-header">
                  <span className="category-indicator" style={{ backgroundColor: category.color }}></span>
                  <strong>
                    <span className="category-emoji" style={{ marginRight: '0.5em' }}>{category.emoji}</span> 
                    {category.name}
                  </strong>
                  <span className={`status-text ${statusClass}`} style={{ color: statusTextColor }}>
                    {isOverBudget ? 'Overspent' : 'Remaining'}: {remainingAmountDisplay}
                    <span className="currency-suffix"> TND</span>
                  </span>
                </div>
                <ProgressBar value={detail.actualSpending} max={detail.budgetAmount} color={progressBarColor} />
                <div className="budget-item-details">
                  <span>Budget: {budgetAmountDisplay}<span className="currency-suffix"> TND</span></span>
                  <span>Spent: {actualSpendingDisplay}<span className="currency-suffix"> TND</span></span>
                  {/* Add Edit Button */} 
                  <button onClick={handleEditClick} className="btn btn-secondary btn-sm edit-budget-btn" disabled={!onEditBudget}>
                    Edit
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

export default BudgetView; 