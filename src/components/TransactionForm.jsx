import React, { useState, useEffect } from 'react';
import { addTransaction, getCategories, updateTransaction } from '../services/localStorageService';

function TransactionForm({ onTransactionSubmit, existingTransaction }) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('expense'); // Default to expense
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const isEditing = !!existingTransaction;

  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
    // Set initial category and type when not editing
    if (loadedCategories.length > 0 && !isEditing) {
      const initialType = 'expense'; // Default to expense
      setType(initialType);
      const firstCategoryOfType = loadedCategories.find(c => c.type === initialType);
      if (firstCategoryOfType) {
        setCategoryId(firstCategoryOfType.id);
      } else {
        // Fallback if no categories of initialType exist (e.g., only income categories)
        setCategoryId(loadedCategories[0].id);
        setType(loadedCategories[0].type); // Also set type to the first category's type
      }
    }
  }, [isEditing]); // Removed categories from dependency array to avoid loop on initial load with empty categories

  useEffect(() => {
    if (isEditing) {
      setDate(existingTransaction.date || new Date().toISOString().split('T')[0]);
      setAmount(existingTransaction.amount || '');
      setCategoryId(existingTransaction.categoryId || '');
      setType(existingTransaction.type || 'expense');
      setNote(existingTransaction.note || '');
    } else {
      // Reset form for adding new transaction is handled by the first useEffect now
      // and the type change effect below.
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setNote('');
      // Type and categoryId are set by the first useEffect or the type change effect
    }
  }, [existingTransaction, isEditing]);

  // Effect to update categoryId when type changes
  useEffect(() => {
    if (!isEditing && categories.length > 0) { // Only run for new transactions and if categories are loaded
      const categoriesOfType = categories.filter(c => c.type === type);
      if (categoriesOfType.length > 0) {
        // If the current categoryId is not of the selected type, or not set, pick the first one
        const currentCategory = categories.find(c => c.id === categoryId);
        if (!currentCategory || currentCategory.type !== type) {
          setCategoryId(categoriesOfType[0].id);
        }
      } else {
        setCategoryId(''); // No categories of this type, so clear selection
      }
    }
  }, [type, categories, isEditing]); // Ensure this runs when type, categories, or isEditing changes

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!date || !amount || !categoryId || !type) {
      setError('Date, Amount, Category, and Type are required.');
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    // Re-validate that the selected categoryId is consistent with the selected type
    const selectedCategoryDetails = categories.find(c => c.id === categoryId);
    if (!selectedCategoryDetails || selectedCategoryDetails.type !== type) {
        setError(`Category "${selectedCategoryDetails?.name || categoryId}" is not valid for type "${type}". Please reselect.`);
        // Potentially reset categoryId here or prompt user.
        // For now, just show error and prevent submission.
        return;
    }

    const transactionPayload = {
      date,
      amount: parseFloat(amount),
      categoryId,
      type, // This type should now be consistent with the categoryId
      note,
    };

    if (isEditing) {
      const updatedData = { ...existingTransaction, ...transactionPayload };
      const result = updateTransaction(updatedData);
      if (result) {
        console.log("Transaction updated:", result);
      } else {
        console.error("Failed to update transaction. It might not exist anymore.");
        setError("Failed to update. Transaction might have been deleted.");
      }
    } else {
      const newTransaction = addTransaction(transactionPayload); 
      console.log('New transaction added:', newTransaction); // This log comes from TransactionForm.jsx
    }
    
    if (!isEditing) {
        setDate(new Date().toISOString().split('T')[0]);
        setAmount('');
        setNote('');
        // Reset type to default (e.g., expense) and category to first of that type
        const defaultNewType = 'expense';
        setType(defaultNewType);
        const firstCategoryOfDefaultType = categories.find(c => c.type === defaultNewType);
        if (firstCategoryOfDefaultType) {
            setCategoryId(firstCategoryOfDefaultType.id);
        } else if (categories.length > 0) {
            setCategoryId(categories[0].id); // Fallback
            setType(categories[0].type); // Match fallback category type
        }
    }

    if (onTransactionSubmit) {
      onTransactionSubmit(); 
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="transaction-form-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      <h3>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div>
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="form-group amount-group">
        <label htmlFor="amount">Amount <span className="currency-suffix">(TND)</span></label>
        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" required />
      </div>

      <div>
        <label htmlFor="type">Type:</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="category">Category:</label>
        <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          {categories.filter(c => c.type === type).length === 0 && <option value="" disabled>{type ? `No ${type} categories` : "Select type first"}</option>}
          {categories.filter(c => c.type === type).map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {categories.filter(c => c.type === type).length === 0 && type && categories.length > 0 && (
            <p style={{fontSize: '0.8em', color: 'orange'}}>No {type} categories. Add one in Settings.</p>
        )}
      </div>

      <div>
        <label htmlFor="note">Note (Optional):</label>
        <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
      </div>

      <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>
        {isEditing ? 'Update Transaction' : 'Add Transaction'}
      </button>
    </form>
  );
}

export default TransactionForm; 