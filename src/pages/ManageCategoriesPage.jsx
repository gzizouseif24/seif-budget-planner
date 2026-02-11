import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, updateCategory, deleteCategory as deleteCategoryService } from '../services/localStorageService';
import '../components/CategoryManager.css'; // Reuse styles if applicable, or create new ones

// TODO: Consider moving the category edit form/modal here or as a sub-component

function ManageCategoriesPage(props) {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  // TODO: Add state for editingCategory if editing is handled on this page
  // const [editingCategory, setEditingCategory] = useState(null);
  
  const navigate = useNavigate();

  // Props from App.jsx might be needed if we want global refresh, e.g., onCategoryUpdated
  const { onCategoryUpdated } = props;

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = () => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
  };

  // TODO: Adapt or import handleEditCategory logic
  // For now, a placeholder or navigation to an edit form could be used.
  const handleEditCategoryClick = (category) => {
    console.log("Edit category clicked:", category);
    // Option 1: Navigate to a dedicated edit page (e.g., /edit-category/:id)
    // navigate(`/edit-category/${category.id}`);
    // Option 2: Implement an inline form or modal on this page (more complex state management here)
    alert("Edit functionality for this page is a TODO!");
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This might affect existing transactions using this category.')) {
      const success = deleteCategoryService(categoryId);
      if (success) {
        loadCategoriesData(); // Reload after delete
        if (onCategoryUpdated) { // Trigger global refresh if provided
          onCategoryUpdated();
        }
      } else {
        setError('Failed to delete category.');
      }
    }
  };

  return (
    <div className="page-container" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Manage Existing Categories</h2>
      </div>
      
      {error && <p className="category-form-error" style={{ textAlign: 'center' }}>{error}</p>}

      {categories.length === 0 ? (
        <p className="no-categories-message" style={{ textAlign: 'center', marginTop: '2rem' }}>No categories defined yet.</p>
      ) : (
        <div className="category-list-scroll-container" style={{ marginTop: '1rem' }}> {/* Copied from CategoryManager */}
          <ul className="existing-categories-list"> {/* Copied from CategoryManager */}
            {categories.map(category => (
              <li key={category.id} className={`category-item`}> {/* Removed editing class for now */}
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
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)} 
                    className="btn btn-danger btn-sm"
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
  );
}

export default ManageCategoriesPage; 