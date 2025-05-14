import React, { useRef } from 'react';
import { getTransactions, getCategories, addTransaction, addCategory, generateId } from '../services/localStorageService'; // Added addTransaction, addCategory, generateId

// Import components to be rendered on this page
import CategoryManager from '../components/CategoryManager';
import './SettingsPage.css'; // Import the new CSS file

// Import the logo
import appLogo from '../assets/logo.png'; 

// Import styles for this page if any
// import './SettingsPage.css';

function SettingsPage(props) {
  // Destructure props passed from App.jsx
  const {
    onCategoryUpdated, // Callback to App.jsx when categories are updated
    // appRefreshKey, // CategoryManager handles its own data loading, but uses onCategoryUpdated for global effect
    // other global props if needed
  } = props;

  const handleExportTransactions = () => {
    const transactions = getTransactions();
    const categories = getCategories();

    if (transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const categoryMap = categories.reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {});

    // Helper to escape CSV data
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return "";
      const stringField = String(field);
      // If the field contains a comma, newline or double quote, enclose it in double quotes
      if (stringField.includes(',') || stringField.includes('\\n') || stringField.includes('"')) {
        // Escape existing double quotes by doubling them
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const header = ["ID", "Date", "Type", "CategoryName", "Amount", "Note"];
    let csvContent = header.join(",") + "\n";

    transactions.forEach(transaction => {
      const categoryName = categoryMap[transaction.categoryId] || "Uncategorized";
      const row = [
        escapeCSV(transaction.id),
        escapeCSV(transaction.date),
        escapeCSV(transaction.type),
        escapeCSV(categoryName),
        escapeCSV(transaction.amount),
        escapeCSV(transaction.note)
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "transactions_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("CSV export is not supported in your browser.");
    }
  };

  return (
    <div 
      className="page-container" 
      style={{ padding: '1rem' }}
    >
      <h2 style={{ marginBottom: '1.5rem' }}>Settings</h2>

      <CategoryManager 
        onCategoryUpdated={onCategoryUpdated} 
      />

      {/* <div className="data-management-section">
        <h3>Data Management</h3>
        
        <div className="data-management-action">
          <h4>Export Data (CSV)</h4>
          <p>Download all your transaction data as a CSV file.</p>
          <button onClick={handleExportTransactions} className="btn btn-secondary">
            Export Transactions
          </button>
        </div>

      </div> */}
      
      {/* Placeholder for other settings like Dark Mode toggle, etc. */}
      {/* 
      <hr style={{ margin: '40px 0'}}/>
      <div className="other-settings-section" style={{ margin: '20px auto', maxWidth: '600px' }}>
        <h3>App Settings</h3>
        <p><em>(Other app-specific settings will go here)</em></p>
      </div>
      */}

    </div>
  );
}

export default SettingsPage; 