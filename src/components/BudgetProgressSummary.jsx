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

  return (
    <div className="budget-planner-summary-card">
      <h4>Budget Planner ({currentMonthPeriod})</h4>
      
      <div className="budget-summary-figures">
        <div>
          <strong>Total Budgeted</strong>
          <p>${summary.totalBudgeted.toFixed(2)}</p>
        </div>
        <div>
          <strong>Total Spent</strong>
          <p>${summary.totalSpentOnBudgetedCategories.toFixed(2)}</p>
        </div>
      </div>

      <div className="overall-progress-bar-container">
        <div 
          className="overall-progress-bar-fill"
          style={{ width: `${displayUtilization}%` }}
          role="progressbar"
          aria-valuenow={utilization}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {utilization.toFixed(0)}%
        </div>
      </div>
      {/* Removed other detailed items like categories over/under budget for a cleaner summary */}
    </div>
  );
}

export default BudgetProgressSummary; 