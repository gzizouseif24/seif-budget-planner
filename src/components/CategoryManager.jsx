import React, { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory as deleteCategoryService } from '../services/localStorageService';
import './CategoryManager.css'; // Import the new CSS file

function CategoryManager({ onCategoryUpdated }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense'); // Default to expense
  const [newCategoryColor, setNewCategoryColor] = useState('#000000'); // Default to black
  const [newCategoryEmoji, setNewCategoryEmoji] = useState(''); // State for emoji
  const [error, setError] = useState('');
  
  // State for tracking the category being edited
  const [editingCategoryId, setEditingCategoryId] = useState(null); 

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = () => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategoryType('expense');
    setNewCategoryColor('#000000');
    setNewCategoryEmoji('');
    setError('');
    setEditingCategoryId(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    // Adjust duplicate check for editing
    const trimmedNameLower = newCategoryName.trim().toLowerCase();
    if (categories.some(cat => 
        cat.name.toLowerCase() === trimmedNameLower && cat.id !== editingCategoryId // Exclude the category being edited
      )) {
      setError('A category with this name already exists.');
      return;
    }

    const categoryData = {
      id: editingCategoryId, // Will be null if adding, contains ID if editing
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryColor,
      emoji: newCategoryEmoji.trim(),
    };

    if (editingCategoryId) {
      // Update existing category
      const updated = updateCategory(categoryData);
      if (!updated) {
        setError('Failed to update category. Please try again.');
        // Optionally, don't reset form if update fails
        return; 
      }
      console.log('Category updated:', updated);
    } else {
      // Add new category (addCategory handles ID generation)
      const added = addCategory(categoryData); // addCategory returns the new category
      console.log('Category added:', added);
    }

    resetForm(); // Reset form and editing state
    loadCategoriesData(); // Re-load categories

    if (onCategoryUpdated) {
      onCategoryUpdated();
    }
  };

  // Function to populate form for editing
  const handleEditCategoryClick = (category) => {
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
    setNewCategoryType(category.type);
    setNewCategoryColor(category.color || '#000000');
    setNewCategoryEmoji(category.emoji || '');
    setError(''); // Clear any previous errors
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This might affect existing transactions using this category.')) {
      // If deleting the category currently being edited, reset the form
      if (categoryId === editingCategoryId) {
        resetForm();
      }
      
      const success = deleteCategoryService(categoryId);
      if (success) {
        console.log('Category deleted:', categoryId);
        loadCategoriesData();
        if (onCategoryUpdated) {
          onCategoryUpdated();
        }
      } else {
        console.warn('Failed to delete category:', categoryId);
        setError('Failed to delete category.');
      }
    }
  };

  return (
    // The main container class will be applied by SettingsPage to wrap this and Data Management
    // For standalone use, or if SettingsPage doesn't provide a card, this could be .category-manager-card
    <div className="category-manager-component"> {/* Changed from category-manager-container to avoid conflict if nested */} 
      {/* Title for the whole manager, if SettingsPage doesn't provide a more global one */}
      {/* <h3>Manage Categories</h3> */}
      
      <form onSubmit={handleFormSubmit} className="add-category-form">
        <h4>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h4>
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
            {editingCategoryId ? 'Update Category' : 'Add Category'}
          </button>
          {editingCategoryId && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="existing-categories-section">
        <h4>Existing Categories</h4>
        {categories.length === 0 ? (
          <p className="no-categories-message">No categories defined yet.</p>
        ) : (
          <div className="category-list-scroll-container">
            <ul className="existing-categories-list">
              {categories.map(category => (
                <li key={category.id} className={`category-item ${category.id === editingCategoryId ? 'editing' : ''}`}>
                  <div className="category-info">
                    <span 
                      className="category-color-swatch"
                      style={{ backgroundColor: category.color || '#ccc' }}
                    ></span>
                    {category.emoji && <span className="category-emoji">{category.emoji}</span>}
                    <span className="category-name">{category.name}</span>
                    <span className="category-type">({category.type})</span>
                  </div>
                  <div className="category-actions">
                    <button 
                      onClick={() => handleEditCategoryClick(category)} 
                      className="btn btn-secondary btn-sm btn-edit" 
                      disabled={editingCategoryId === category.id}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)} 
                      className="btn btn-danger btn-sm"
                      disabled={editingCategoryId === category.id}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryManager; 