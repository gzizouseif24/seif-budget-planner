import React, { useRef } from 'react';
import { getTransactions, getCategories, addTransaction, addCategory, generateId } from '../services/localStorageService'; // Added addTransaction, addCategory, generateId

// Import components to be rendered on this page
import CategoryManager from '../components/CategoryManager';
import './SettingsPage.css'; // Import the new CSS file

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

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    // Trigger click on the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset file input to allow re-selecting the same file
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.csv')) {
      alert("Please select a valid .csv file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvContent = e.target.result;
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');

      if (lines.length <= 1) {
        alert("CSV file is empty or contains only a header.");
        return;
      }

      const headerLine = lines[0].trim();
      // Expected header: "ID","Date","Type","CategoryName","Amount","Note"
      // For robustness, parse the header to get indices, but for now, assume fixed order
      const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, ''));
      const expectedHeaders = ["ID", "Date", "Type", "CategoryName", "Amount", "Note"];
      // Simple validation for now - can be made more robust
      if (headers.length < 5 || !expectedHeaders.every((eh, i) => headers[i] === eh)) {
        alert(`Invalid CSV header. Expected: ${expectedHeaders.join(',')}. Got: ${headerLine}`);
        return;
      }

      let existingCategories = getCategories();
      const categoryNameToIdMap = existingCategories.reduce((map, cat) => {
        map[cat.name.toLowerCase()] = cat.id;
        return map;
      }, {});
      const categoryNameToTypeMap = existingCategories.reduce((map, cat) => {
        map[cat.name.toLowerCase()] = cat.type;
        return map;
      }, {});

      let importedCount = 0;
      let errors = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Basic CSV field splitting (does not handle commas within quoted fields perfectly)
        // This assumes fields are either unquoted, or fully quoted if they contain special chars.
        // Our export function quotes fields with commas/newlines/quotes.
        const values = [];
        let currentField = '';
        let inQuotes = false;
        for (let char of line) {
            if (char === '"' && (currentField === '' || currentField.endsWith('"'))) {
                inQuotes = !inQuotes;
                currentField += char; // Keep quotes for now, will remove later if needed
            } else if (char === ',' && !inQuotes) {
                values.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField); // Add the last field

        // Clean up quotes from fields (if they are fully quoted)
        const cleanedValues = values.map(v => v.replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));

        if (cleanedValues.length < 5) {
            errors.push(`Skipping line ${i+1}: Not enough columns.`);
            continue;
        }

        // Assuming order: ID, Date, Type, CategoryName, Amount, Note
        const transactionIdFromCSV = cleanedValues[0]; // We ignore this ID for import
        const date = cleanedValues[1]?.trim(); // Trim date just in case
        const type = cleanedValues[2]?.toLowerCase().trim(); // Trim and lowercase type
        const categoryName = cleanedValues[3]?.trim();      // Trim categoryName
        const amountString = cleanedValues[4]?.trim();   // Trim amount string
        const note = cleanedValues[5]?.trim() || ''; // Trim note, default to empty string

        if (!date || !type || !categoryName || amountString === undefined || amountString === '' || isNaN(parseFloat(amountString))) {
          errors.push(`Skipping line ${i+1}: Missing or invalid required fields (Date, Type, CategoryName, Amount). Data: ${line}`);
          continue;
        }
        
        const amount = parseFloat(amountString);

        let categoryId = categoryNameToIdMap[categoryName.toLowerCase()]; // Uses trimmed categoryName
        let categoryType = categoryNameToTypeMap[categoryName.toLowerCase()]; // Uses trimmed categoryName

        if (!categoryId) {
          // Category not found, try to create it
          const newCategoryData = {
            name: categoryName, // Use trimmed categoryName
            type: type, // Use trimmed type
            color: '#808080' // Default color for imported categories
          };
          try {
            const newAddedCategory = addCategory(newCategoryData);
            categoryId = newAddedCategory.id;
            // Update maps for subsequent rows in the same import batch
            existingCategories.push(newAddedCategory);
            categoryNameToIdMap[newAddedCategory.name.toLowerCase()] = newAddedCategory.id;
            categoryNameToTypeMap[newAddedCategory.name.toLowerCase()] = newAddedCategory.type;
            console.log(`Created new category: ${categoryName} with type ${type}`);
          } catch (catError) {
            errors.push(`Error creating category '${categoryName}' for line ${i+1}: ${catError.message}. Skipping transaction.`);
            continue;
          }
        } else if (type !== categoryType) {
            // Category exists but type mismatch (e.g. CSV says income, category is expense)
            errors.push(`Skipping line ${i+1}: Transaction type '${type}' for category '${categoryName}' does not match existing category type '${categoryType}'.`);
            continue;
        }

        const newTransactionData = {
          date,
          amount,
          categoryId,
          type,
          note,
        };

        try {
          addTransaction(newTransactionData);
          importedCount++;
        } catch (transError) {
          errors.push(`Error importing transaction for line ${i+1} ('${categoryName}'): ${transError.message}`);
        }
      }

      // DEBUG: Log transactions immediately after import loop
      const transactionsAfterImport = getTransactions();
      console.log('[SettingsPage] Transactions in LS after import loop:', transactionsAfterImport.length, transactionsAfterImport.slice(-5));
      // DEBUG: Log categories as well
      const categoriesAfterImport = getCategories();
      console.log('[SettingsPage] Categories in LS after import loop:', categoriesAfterImport.length, categoriesAfterImport.slice(-5));

      if (onCategoryUpdated) {
        onCategoryUpdated(); // Trigger app refresh
      }

      let summaryMessage = `${importedCount} transaction(s) imported successfully.`;
      if (errors.length > 0) {
        summaryMessage += `\n\nEncountered ${errors.length} error(s):\n- ${errors.join('\n- ')}`;
        console.warn("Import errors:", errors);
      }
      alert(summaryMessage);
    };

    reader.onerror = () => {
      alert("Failed to read the file.");
    };

    reader.readAsText(file);
  };

  return (
    <div className="settings-page-card"> {/* Main card container */}
      <h2>Settings</h2>

      {/* CategoryManager will now live inside this card styling */}
      {/* Its own h3/h4 titles will be styled by CategoryManager.css to fit */}
      <CategoryManager 
        onCategoryUpdated={onCategoryUpdated} 
      />

      <div className="data-management-section">
        <h3>Data Management</h3>
        
        <div className="data-management-action">
          <h4>Export Data (CSV)</h4>
          <p>Export your transaction data to a CSV file.</p>
          {/* The button uses global .btn but will be overridden by .data-management-action .btn from SettingsPage.css */}
          <button className="btn" onClick={handleExportTransactions}>Export Transactions (CSV)</button> 
        </div>

        <div className="data-management-action">
          <h4>Import Data (CSV)</h4>
          <p>Import transactions from a CSV file. Ensure the file follows the specified format.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".csv"
            onChange={handleFileSelected}
          />
          <button className="btn" onClick={handleImportClick}>Import Transactions (CSV)</button>
        </div>
      </div>
      
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