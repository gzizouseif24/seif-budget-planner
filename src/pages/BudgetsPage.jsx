import React from 'react';

// Import components to be rendered on this page
import BudgetPlanner from '../components/BudgetPlanner';
import BudgetView from '../components/BudgetView';

// Import styles for this page if any
// import './BudgetsPage.css';

function BudgetsPage(props) {
  // Destructure props passed from App.jsx
  const {
    appRefreshKey,
    // currentMonthPeriod, // Both BudgetPlanner and BudgetView manage this internally
    // triggerAppRefresh // Pass if direct refresh from these components is needed for App state
  } = props;

  return (
    <div className="budgets-page-container">
      {/* <h2>Budgets</h2> // Optional title for the page itself */}
      
      <BudgetPlanner 
        appRefreshKey={appRefreshKey} 
      />

      <hr style={{ margin: '30px 0'}}/>

      <BudgetView 
        appRefreshKey={appRefreshKey} 
      />
    </div>
  );
}

export default BudgetsPage; 