import React, { useState, useEffect } from 'react';
import {
  calculateTotalIncomeForPeriod,
  calculateTotalExpensesForPeriod,
} from '../services/budgetUtils';
import './DashboardSummary.css';

// Component now receives currentMonthPeriod directly from DashboardPage
function DashboardSummary({ appRefreshKey, currentMonthPeriod }) { 
  const [summaryData, setSummaryData] = useState({ totalIncome: 0, totalExpenses: 0 });
  const [loading, setLoading] = useState(true);

  // Removed useEffect that was setting currentMonthPeriod locally as it's now a prop

  useEffect(() => {
    if (!currentMonthPeriod) {
      // If currentMonthPeriod is not yet available, perhaps wait or show a specific state
      // For now, if it's missing, we might show loading or an empty state to avoid errors.
      setLoading(true); // Keep loading if period is not set
      return;
    }

    setLoading(true);
    const income = calculateTotalIncomeForPeriod(currentMonthPeriod);
    const expenses = calculateTotalExpensesForPeriod(currentMonthPeriod);

    setSummaryData({
      totalIncome: income,
      totalExpenses: expenses,
      // netBalance removed
    });
    setLoading(false);
  }, [currentMonthPeriod, appRefreshKey]);

  if (loading || !currentMonthPeriod) { // Show loading if no period or still loading data
    return <p className="loading-message">Loading summary...</p>;
  }

  return (
    <div className="dashboard-summary-card"> {/* Changed class for new design */}
      <h3>Dashboard Summary (for {currentMonthPeriod})</h3>
      <div className="summary-values-container">
        <div className="summary-value-item income-value-item">
          <span className="summary-label">TOTAL INCOME</span>
          <p className="amount income-amount">${summaryData.totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-value-item expense-value-item">
          <span className="summary-label">TOTAL EXPENSES</span>
          <p className="amount expense-amount">${summaryData.totalExpenses.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardSummary; 