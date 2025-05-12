import React, { useState } from 'react';

// Import components
import BudgetView from '../components/BudgetView';
import BudgetForm from '../components/BudgetForm'; // Import the new form

// Import styles for this page if any
// import './BudgetsPage.css';

function BudgetsPage(props) {
  // Destructure props passed from App.jsx
  const {
    appRefreshKey,
    currentMonthPeriod, // Get this prop from App.jsx
    triggerAppRefresh // Assuming this function exists in App.jsx to force updates
  } = props;

  // State for managing the budget form modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null); // null for adding, budget object for editing

  const openBudgetModal = (budgetToEdit = null) => {
    setEditingBudget(budgetToEdit);
    setIsBudgetModalOpen(true);
  };

  const closeBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null); // Clear editing state on close
  };

  // Handler to be called after budget is successfully added/edited
  const handleBudgetSubmit = () => {
    if (triggerAppRefresh) {
      triggerAppRefresh(); // Refresh data across the app
    }
    // Modal is closed by the form itself upon successful submission
  };

  return (
    <div className="budgets-page-container">
      {/* Button to add a new budget */}
      <div className="add-budget-button-container" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        <button onClick={() => openBudgetModal()} className="btn btn-primary">
          + Add Budget
        </button>
      </div>

      {/* Budget meters view */}
      <BudgetView 
        appRefreshKey={appRefreshKey} 
        onEditBudget={openBudgetModal} // Pass handler to open modal for editing
      />

      {/* Budget Form Modal */}
      <BudgetForm 
        isOpen={isBudgetModalOpen}
        onClose={closeBudgetModal}
        onBudgetSubmit={handleBudgetSubmit}
        existingBudget={editingBudget}
        currentMonthPeriod={currentMonthPeriod} // Pass the period down
      />
    </div>
  );
}

export default BudgetsPage; 