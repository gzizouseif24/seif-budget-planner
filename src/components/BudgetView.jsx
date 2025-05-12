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
          backgroundColor: color || 'var(--accent-color-green)', // Use CSS variable as default
        }}
      >
        {/* Optional: display percentage text inside bar if desired */}
        {/* {Math.round(percentage)}% */}
      </div>
    </div>
  );
};

function BudgetView({ appRefreshKey }) {
  const [budgetDetails, setBudgetDetails] = useState([]);
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
    const expenseCategories = allCategories.filter(cat => cat.type === 'expense');
    
    const details = expenseCategories.map(category => {
      const budgetData = getBudgetForCategoryAndPeriod(category.id, currentMonthPeriod);
      const budgetAmount = budgetData ? budgetData.amount : 0;
      // Ensure budgetAmount is treated as a number for calculations
      const numericBudgetAmount = Number(budgetAmount) || 0; 
      const actualSpending = calculateActualSpending(category.id, currentMonthPeriod);
      const remainingAmount = numericBudgetAmount - actualSpending;
      
      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color, // Retain for potential future use, though not directly used in new styles
        budgetAmount: numericBudgetAmount,
        actualSpending,
        remainingAmount,
      };
    }).filter(detail => detail.budgetAmount > 0);

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
      <h3>Budget Status (for {currentMonthPeriod})</h3>
      {budgetDetails.length === 0 ? (
        <p className="no-budgets-message">
          No budgets set for expense categories this month, or no expense categories exist. 
          Set budgets in the Budget Planner.
        </p>
      ) : (
        <ul className="budget-view-list">
          {budgetDetails.map(detail => {
            const isOverBudget = detail.remainingAmount < 0;
            const spendingPercentage = detail.budgetAmount > 0 ? (detail.actualSpending / detail.budgetAmount) * 100 : 0;
            
            let progressBarColor = 'var(--accent-color-green)'; // Default green
            let statusClass = 'on-track';

            if (spendingPercentage > 100) {
                progressBarColor = 'var(--accent-color-red)'; // Red for over budget
                statusClass = 'over-budget';
            } else if (spendingPercentage > 75) {
                progressBarColor = 'var(--accent-color-yellow)'; // Yellow for nearing budget
                // statusClass remains 'on-track' or a new one like 'nearing-limit' can be added if needed
            }
            
            // Ensure budgetAmount is a number before calling toFixed
            const budgetAmountDisplay = typeof detail.budgetAmount === 'number' ? detail.budgetAmount.toFixed(2) : '0.00';
            const actualSpendingDisplay = typeof detail.actualSpending === 'number' ? detail.actualSpending.toFixed(2) : '0.00';
            const remainingAmountDisplay = typeof detail.remainingAmount === 'number' ? Math.abs(detail.remainingAmount).toFixed(2) : '0.00';

            return (
              <li key={detail.categoryId} className="budget-view-item">
                <div className="budget-item-header">
                  <strong>{detail.categoryName}</strong>
                  <span className={`status-text ${statusClass}`}>
                    {isOverBudget ? 'Overspent' : 'Remaining'}: ${remainingAmountDisplay}
                  </span>
                </div>
                <ProgressBar value={detail.actualSpending} max={detail.budgetAmount} color={progressBarColor} />
                <div className="budget-item-details">
                  <span>Budget: ${budgetAmountDisplay}</span>
                  <span>Spent: ${actualSpendingDisplay}</span>
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