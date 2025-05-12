import React from 'react';

// Import components to be rendered on this page
import SpendingByCategoryChart from '../components/SpendingByCategoryChart';
import MonthlySpendingTrendChart from '../components/MonthlySpendingTrendChart';

// Import styles for this page if any
// import './ReportsPage.css';

function ReportsPage(props) {
  // Destructure props passed from App.jsx
  const {
    appRefreshKey,
    currentMonthPeriod,
    // triggerAppRefresh // Pass if direct refresh from these components is needed for App state
  } = props;

  return (
    <div className="reports-page-container">
      {/* <h2>Reports</h2> */}

      <SpendingByCategoryChart 
        appRefreshKey={appRefreshKey} 
        currentMonthPeriod={currentMonthPeriod} 
      />

      <hr style={{ margin: '30px 0'}}/>

      {/* MonthlySpendingTrendChart takes appRefreshKey to update if transactions change */}
      {/* It calculates its own date range based on NUM_MONTHS_TREND */}
      <MonthlySpendingTrendChart 
        appRefreshKey={appRefreshKey} 
      />
    </div>
  );
}

export default ReportsPage; 