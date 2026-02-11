import React, { useState, useEffect } from 'react';
import {
  calculateTotalIncomeForPeriod,
  calculateTotalExpensesForPeriod,
} from '../services/budgetUtils';
import { useCurrency } from '../context/CurrencyContext';
import './DashboardSummary.css';

// Component now receives currentMonthPeriod directly from DashboardPage
function DashboardSummary({ appRefreshKey, currentMonthPeriod }) {
  const [summaryData, setSummaryData] = useState({ totalIncome: 0, totalExpenses: 0 });
  const [loading, setLoading] = useState(true);
  const { formatAmount, getCurrencySymbol } = useCurrency();

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

  const remainingBalance = summaryData.totalIncome - summaryData.totalExpenses;
  const balanceColorClass = remainingBalance >= 0 ? 'positive-balance' : 'negative-balance';

  return (
    <div className="dashboard-summary-card"> {/* Changed class for new design */}
      {/*<h3>Dashboard Summary (for {currentMonthPeriod})</h3>*/}
      
      {/* New Layout Starts Here */}
      <div className="summary-layout-container">
        <div className="summary-top-row">
          <div className="summary-detail-item summary-expenses-small">
            <span className="summary-label-small">TOTAL EXPENSES</span>
            <p className="amount-small expense-amount">
              {formatAmount(summaryData.totalExpenses)}
              <span className="currency-suffix"> {getCurrencySymbol()}</span>
            </p>
          </div>
          <div className="summary-detail-item summary-income-small">
            <span className="summary-label-small">TOTAL INCOME</span>
            <p className="amount-small income-amount">
              {formatAmount(summaryData.totalIncome)}
              <span className="currency-suffix"> {getCurrencySymbol()}</span>
            </p>
          </div>
        </div>

        <div className="summary-remaining-balance">
          <span className="summary-label-large">REMAINING MONEY</span>
          <p className={`amount-large ${balanceColorClass}`}>
            {formatAmount(remainingBalance)}
            <span className="currency-suffix"> {getCurrencySymbol()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardSummary; 