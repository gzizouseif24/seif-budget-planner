import React, { useState, useEffect } from 'react';
import { getCategories, saveBudget, getBudgets } from '../services/localStorageService';
import './BudgetForm.css';

function BudgetForm({ isOpen, onClose, onBudgetSubmit, existingBudget, currentMonthPeriod }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currentBudgets, setCurrentBudgets] = useState({}); // Store existing budgets {categoryId: amount}
  const [error, setError] = useState('');

  const isEditing = Boolean(existingBudget);

  // Load categories and existing budgets when component mounts or opens
  useEffect(() => {
    if (isOpen) {
      const loadedCategories = getCategories().filter(c => c.type === 'expense'); // Only budget for expenses
      const loadedBudgets = getBudgets(); // Fetch all budgets
      setCategories(loadedCategories);
      setCurrentBudgets(loadedBudgets);

      if (isEditing) {
        setSelectedCategory(existingBudget.categoryId);
        setAmount(existingBudget.amount.toString());
      } else {
        // Reset form for adding
        setSelectedCategory('');
        setAmount('');
      }
      setError(''); // Clear errors when opening
    } else {
      // Reset state if modal closes without submitting (optional)
      // setError('');
      // setSelectedCategory('');
      // setAmount('');
    }
  }, [isOpen, isEditing, existingBudget]);

  // Filter categories: For editing, show only the one being edited.
  // For adding, show only expense categories that DON'T already have a budget.
  const availableCategories = isEditing 
    ? categories.filter(c => c.id === existingBudget.categoryId)
    : categories.filter(c => !currentBudgets[c.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const budgetAmount = parseFloat(amount);

    if (!selectedCategory) {
      setError('Please select a category.');
      return;
    }
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    // Include period in the data sent to saveBudget
    const budgetData = {
      categoryId: selectedCategory,
      amount: budgetAmount,
      period: currentMonthPeriod // Add the period
    };

    try {
      // Check if period is actually available before saving
      if (!budgetData.period) {
          throw new Error("Budget period is missing. Cannot save.");
      }
      saveBudget(budgetData); // Assumes saveBudget handles both add and update based on categoryId
      onBudgetSubmit(); // Notify parent to refresh/close
      onClose(); // Close the modal/form
    } catch (err) {
      setError(err.message || 'Failed to save budget.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay budget-form-modal-overlay" onClick={onClose}> 
      <div className="modal-content budget-form-modal-content" onClick={(e) => e.stopPropagation()}> 
        <h2>{isEditing ? 'Edit Budget' : 'Add Budget'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              disabled={isEditing} // Disable category change when editing
            >
              <option value="" disabled={!isEditing}> {isEditing ? '' : '-- Select Category --'} </option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.iconEmoji} {cat.name}
                </option>
              ))}
              {/* If editing, add the selected category back if it wasn't in the initial list (edge case) */}
              {isEditing && !availableCategories.find(c=>c.id === existingBudget.categoryId) && 
                (() => {
                    const editedCat = categories.find(c=>c.id === existingBudget.categoryId);
                    return editedCat ? <option key={editedCat.id} value={editedCat.id}>{editedCat.iconEmoji} {editedCat.name}</option> : null;
                })()
              }
            </select>
            {availableCategories.length === 0 && !isEditing && 
              <p className='no-categories-note'>All expense categories already have budgets.</p>
            }
          </div>
          <div className="form-group">
            <label htmlFor="amount">Budget Amount <span className="currency-suffix">(TND)</span></label>
            <input 
              type="number" 
              id="amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 500"
              min="0.01" 
              step="0.01"
              required 
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={availableCategories.length === 0 && !isEditing}> 
              {isEditing ? 'Save Changes' : 'Add Budget'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetForm; 