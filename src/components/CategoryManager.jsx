import React, { useState, useEffect } from 'react';
// Import useNavigate for navigation
import { useNavigate } from 'react-router-dom'; 
import { getCategories, addCategory, updateCategory, deleteCategory as deleteCategoryService } from '../services/localStorageService';
import './CategoryManager.css'; // Import the new CSS file

function CategoryManager({ onCategoryUpdated }) {
  // Remove categories state and related logic for displaying the list
  // const [categories, setCategories] = useState([]); 
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [newCategoryColor, setNewCategoryColor] = useState('#000000');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');
  const [error, setError] = useState('');
  
  // Editing state remains as the form can still be used for editing if invoked that way
  // but for this simplified version, we assume it's primarily for adding on SettingsPage.
  // If SettingsPage passes an editingTransaction, this form could adapt, but that's not the current flow.
  const [editingCategoryId, setEditingCategoryId] = useState(null); 
  // Remove isExistingCategoriesVisible state
  // const [isExistingCategoriesVisible, setIsExistingCategoriesVisible] = useState(true);

  const navigate = useNavigate(); // Hook for navigation

  // useEffect to load categories is no longer needed here as the list is not displayed.
  // The form itself might need categories for duplicate checking, so we load them in handleFormSubmit or on mount.
  const [formCategories, setFormCategories] = useState([]);
  useEffect(() => {
    setFormCategories(getCategories());
  }, []);

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategoryType('expense');
    setNewCategoryColor('#000000');
    setNewCategoryEmoji('');
    setError('');
    setEditingCategoryId(null); // Still useful to reset if form was hypothetically in edit mode
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    const trimmedNameLower = newCategoryName.trim().toLowerCase();
    // Use formCategories for duplicate check
    if (formCategories.some(cat => 
        cat.name.toLowerCase() === trimmedNameLower && cat.id !== editingCategoryId
      )) {
      setError('A category with this name already exists.');
      return;
    }

    const categoryData = {
      // If this component were to handle editing, editingCategoryId would be used here.
      // For now, assume SettingsPage uses it for adding only.
      id: null, // Explicitly null for adding a new category via this simplified form
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryColor,
      emoji: newCategoryEmoji.trim(),
    };

    // For this simplified form on SettingsPage, we primarily expect adding new categories.
    // The editingCategoryId logic is kept in case this component is reused for editing elsewhere,
    // but `SettingsPage` doesn't currently trigger an edit mode for this form.
    if (editingCategoryId) {
      // This path would be taken if editingCategoryId was set (e.g. by a prop)
      updateCategory({ ...categoryData, id: editingCategoryId });
    } else {
      addCategory(categoryData); 
    }

    resetForm();
    setFormCategories(getCategories()); // Refresh categories for duplicate check

    if (onCategoryUpdated) {
      onCategoryUpdated(); // Notify App.jsx to trigger global refresh
    }
    // Optionally, navigate to the manage page or show a success message.
    // For now, just resets and allows adding another.
  };

  // Remove handleEditCategoryClick and handleDeleteCategory as list is gone

  return (
    <div className="category-manager-component">
      <form onSubmit={handleFormSubmit} className="add-category-form" style={{ position: 'relative' }}>
        {/* Removed <h4>Add New Category</h4> */}
        
        {/* Icon to navigate to Manage Categories page */}
        <span 
          onClick={() => navigate('/manage-categories')}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '0.8rem', // Reduced size
            cursor: 'pointer',
            padding: '5px' // Add some padding for easier clicking
          }}
          title="Manage Existing Categories" // Tooltip for accessibility
          role="button" // Accessibility role
          aria-label="Manage Existing Categories"
        >
          ▼ {/* Changed to Dropdown/chevron icon */}
        </span>

        {error && <p className="category-form-error">{error}</p>}
        <div className="form-group">
          <label htmlFor="newCatName">Name:</label>
          <input 
            type="text" 
            id="newCatName" 
            value={newCategoryName} 
            onChange={(e) => setNewCategoryName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="newCatType">Type:</label>
          <select 
            id="newCatType" 
            value={newCategoryType} 
            onChange={(e) => setNewCategoryType(e.target.value)} 
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="newCatColor">Color:</label>
          <input 
            type="color" 
            id="newCatColor" 
            value={newCategoryColor} 
            onChange={(e) => setNewCategoryColor(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="newCatEmoji">Emoji (Optional):</label>
          <input
            type="text"
            id="newCatEmoji"
            value={newCategoryEmoji}
            onChange={(e) => setNewCategoryEmoji(e.target.value)}
            placeholder="e.g., 🛒"
            maxLength="2"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Add Category
          </button>
          {/* Remove Cancel Edit button as edit mode isn't initiated from SettingsPage directly */}
        </div>
      </form>

      {/* Removed the text button to navigate to the Manage Categories page */}
      {/* 
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button 
          type="button" 
          onClick={() => navigate('/manage-categories')} 
          className="btn btn-link"
        >
          View & Manage Existing Categories
        </button>
      </div> 
      */}
    </div>
  );
}

export default CategoryManager; 