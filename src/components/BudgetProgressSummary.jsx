import React, { useState, useEffect } from 'react';
import { getOverallBudgetSummary } from '../services/budgetUtils';
import './BudgetProgressSummary.css'; // Import the new CSS file

function BudgetProgressSummary({ appRefreshKey, currentMonthPeriod }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentMonthPeriod) return;
    setLoading(true);
    const budgetSummaryData = getOverallBudgetSummary(currentMonthPeriod);
    setSummary(budgetSummaryData);
    setLoading(false);
  }, [currentMonthPeriod, appRefreshKey]);

  if (loading) {
    return <div className="loading-message-budget-summary"><p>Loading budget planner for {currentMonthPeriod}...</p></div>;
  }
  if (!summary || summary.budgetedCategoryCount === 0) {
    return <div className="no-budget-message-summary"><p>No budgets set for {currentMonthPeriod} to display planner summary.</p></div>;
  }

  const utilization = summary.overallUtilization || 0;
  const displayUtilization = Math.min(Math.max(utilization, 0), 100); // Cap between 0-100 for progress bar width

  // Determine color based on utilization
  const progressBarColor = utilization >= 100 
    ? 'var(--accent-color-red)' 
    : 'var(--accent-color-green)';

  // Format the text to show spent / budgeted
  const spentText = summary.totalSpentOnBudgetedCategories.toFixed(2);
  const budgetText = summary.totalBudgeted.toFixed(2);
  const barText = `${spentText} TND / ${budgetText} TND`;

  return (
    <div className="budget-planner-summary-card">
      {/*<h4>Budget Planner ({currentMonthPeriod})</h4>*/}
      
      <p className="budget-meter-label">Budget Meter</p>
      
      <div className="overall-progress-bar-container">
        <div 
          className="overall-progress-bar-fill"
          style={{ 
              width: `${displayUtilization}%`,
              backgroundColor: progressBarColor // Use dynamic color
          }}
          role="progressbar"
          aria-valuenow={utilization} // Keep actual utilization here
          aria-valuemin="0"
          // Setting aria-valuemax conceptually to budget amount might be more accurate
          // but visually bar stops at 100. Let's keep 100 for consistency with width.
          aria-valuemax="100" 
        >
          {/* Show Spent / Budget Amount Inside Bar */}
          {barText} 
        </div>
      </div>
    </div>
  );
}

export default BudgetProgressSummary; 